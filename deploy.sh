#!/bin/bash
set -euo pipefail

REGION="us-west-1"
ECR_REGISTRY="537093421907.dkr.ecr.${REGION}.amazonaws.com"
ECR_REPO="${ECR_REGISTRY}/logos-backend"
S3_BUCKET="logos-frontend-prod"
BACKEND_URL="https://api.philo-ai.com"
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

usage() {
    echo "Usage: ./deploy.sh <command>"
    echo ""
    echo "Commands:"
    echo "  backend     Build and push backend image to ECR (Watchtower auto-pulls on EC2)"
    echo "  frontend    Build and deploy the frontend to S3 + CloudFront"
    echo "  restart     SSH into EC2 and manually restart the backend container"
    echo "  ssh         SSH into the EC2 instance"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh backend"
    echo "  ./deploy.sh frontend"
    exit 1
}

get_tf_output() {
    terraform -chdir="${PROJECT_ROOT}/infra" output -raw "$1"
}

deploy_backend() {
    echo "=== Deploying backend ==="

    echo "-> Authenticating with ECR..."
    aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

    echo "-> Building image for linux/amd64..."
    docker buildx build --platform linux/amd64 -t logos-backend "${PROJECT_ROOT}/backend"

    echo "-> Tagging and pushing..."
    docker tag logos-backend:latest "${ECR_REPO}:latest"
    docker push "${ECR_REPO}:latest"

    echo "=== Backend deployed ==="
    echo "Watchtower will auto-pull the new image within 5 minutes."
    echo "Verify: curl ${BACKEND_URL}/"
}

restart_backend() {
    local EC2_IP
    EC2_IP=$(get_tf_output ec2_public_ip)

    echo "-> Connecting to EC2 at ${EC2_IP}..."
    ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 ec2-user@"$EC2_IP" bash -s "$REGION" "$ECR_REGISTRY" "$ECR_REPO" <<'REMOTE'
        REGION="$1"
        ECR_REGISTRY="$2"
        ECR_REPO="$3"

        echo "-> Fetching secrets from SSM..."
        OPENAI_API_KEY=$(aws ssm get-parameter --name /logos/OPENAI_API_KEY --with-decryption --query Parameter.Value --output text --region "$REGION")
        SUPABASE_URL=$(aws ssm get-parameter --name /logos/SUPABASE_URL --with-decryption --query Parameter.Value --output text --region "$REGION")
        SUPABASE_KEY=$(aws ssm get-parameter --name /logos/SUPABASE_KEY --with-decryption --query Parameter.Value --output text --region "$REGION")
        FRONTEND_URL=$(aws ssm get-parameter --name /logos/FRONTEND_URL --with-decryption --query Parameter.Value --output text --region "$REGION")

        echo "-> Authenticating with ECR..."
        aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

        echo "-> Pulling latest image..."
        docker pull "${ECR_REPO}:latest"

        echo "-> Stopping old container..."
        docker stop logos-backend 2>/dev/null || true
        docker rm logos-backend 2>/dev/null || true

        echo "-> Starting new container..."
        docker run -d \
            --name logos-backend \
            --restart unless-stopped \
            -p 8000:8000 \
            -e OPENAI_API_KEY="$OPENAI_API_KEY" \
            -e SUPABASE_URL="$SUPABASE_URL" \
            -e SUPABASE_KEY="$SUPABASE_KEY" \
            -e FRONTEND_URL="$FRONTEND_URL" \
            "${ECR_REPO}:latest"

        echo "-> Container status:"
        docker ps --filter name=logos-backend
REMOTE
}

deploy_frontend() {
    echo "=== Deploying frontend ==="

    echo "-> Building frontend..."
    cd "${PROJECT_ROOT}/frontend"
    VITE_BACKEND_URL="$BACKEND_URL" npm run build

    echo "-> Uploading to S3..."
    aws s3 sync dist/ "s3://${S3_BUCKET}" --delete --region "$REGION"

    echo "-> Invalidating CloudFront cache..."
    local CF_ID
    CF_ID=$(get_tf_output cloudfront_distribution_id)
    aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths "/*" > /dev/null

    echo "=== Frontend deployed ==="
    echo "Verify: curl https://who.philo-ai.com"
}

ssh_ec2() {
    local EC2_IP
    EC2_IP=$(get_tf_output ec2_public_ip)
    echo "-> Connecting to EC2 at ${EC2_IP}..."
    ssh -i ~/.ssh/id_ed25519 ec2-user@"$EC2_IP"
}

case "${1:-}" in
    backend)  deploy_backend ;;
    frontend) deploy_frontend ;;
    restart)  restart_backend ;;
    ssh)      ssh_ec2 ;;
    *)        usage ;;
esac
