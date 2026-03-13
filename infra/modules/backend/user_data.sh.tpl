#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1

echo "=== Starting Logos backend setup ==="

# --- Install Docker ---
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker

# --- Install Caddy ---
dnf install -y 'dnf-command(copr)'
dnf copr enable -y @caddy/caddy epel-9-x86_64
dnf install -y caddy

# --- Configure Caddy ---
cat > /etc/caddy/Caddyfile <<'CADDYFILE'
${domain_name} {
    reverse_proxy localhost:8000
}
CADDYFILE

systemctl enable caddy
systemctl start caddy

# --- Fetch secrets from SSM ---
get_ssm() {
    aws ssm get-parameter \
        --name "$1" \
        --with-decryption \
        --query "Parameter.Value" \
        --output text \
        --region "${region}"
}

OPENAI_API_KEY=$(get_ssm "/logos/OPENAI_API_KEY")
SUPABASE_URL=$(get_ssm "/logos/SUPABASE_URL")
SUPABASE_KEY=$(get_ssm "/logos/SUPABASE_KEY")
FRONTEND_URL=$(get_ssm "/logos/FRONTEND_URL")

# --- Authenticate to ECR and pull image ---
aws ecr get-login-password --region "${region}" | \
    docker login --username AWS --password-stdin "${account_id}.dkr.ecr.${region}.amazonaws.com"

docker pull "${ecr_repo}:latest" || {
    echo "WARNING: No image in ECR yet. Container will start after first push."
    exit 0
}

# --- Run container ---
docker run -d \
    --name logos-backend \
    --restart unless-stopped \
    -p 8000:8000 \
    -e OPENAI_API_KEY="$OPENAI_API_KEY" \
    -e SUPABASE_URL="$SUPABASE_URL" \
    -e SUPABASE_KEY="$SUPABASE_KEY" \
    -e FRONTEND_URL="$FRONTEND_URL" \
    "${ecr_repo}:latest"

# --- ECR credential refresh (tokens expire every 12h) ---
cat > /usr/local/bin/ecr-login.sh <<'ECRLOGIN'
#!/bin/bash
aws ecr get-login-password --region "${region}" | \
    docker login --username AWS --password-stdin "${account_id}.dkr.ecr.${region}.amazonaws.com"
ECRLOGIN
chmod +x /usr/local/bin/ecr-login.sh

# Refresh ECR token every 6 hours
echo "0 */6 * * * root /usr/local/bin/ecr-login.sh >> /var/log/ecr-login.log 2>&1" > /etc/cron.d/ecr-login

# --- Watchtower (auto-pull new images every 5 min) ---
docker run -d \
    --name watchtower \
    --restart unless-stopped \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v /root/.docker/config.json:/config.json:ro \
    containrrr/watchtower \
    logos-backend \
    --interval 300 \
    --cleanup

echo "=== Logos backend setup complete ==="
