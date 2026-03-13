# Logos

AI-powered conversations with historical philosophers.

## Local Development

### Frontend (from `/frontend`)

```bash
npm install
npm run dev
```

### Backend (from `/backend`)

```bash
uv sync
uv run fastapi run main:app --reload
```

## Deployment

The app is hosted on AWS, managed by Terraform. The frontend is a React SPA served via S3 + CloudFront. The backend is a Dockerized FastAPI app running on EC2.

- **Frontend**: `https://logos.philo-ai.com`
- **Backend API**: `https://api.philo-ai.com`

### Prerequisites

1. [AWS CLI](https://aws.amazon.com/cli/) installed and configured (`aws configure`)
2. [Terraform](https://www.terraform.io/) installed
3. [Docker](https://www.docker.com/) installed
4. Domain `philo-ai.com` hosted zone exists in Route 53

### 1. Provision Infrastructure

```bash
# First time only: create the TF state backend
cd infra/bootstrap
terraform init
terraform apply

# Then uncomment the backend block in infra/backend.tf and:
cd ../
terraform init
```

Create your variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your real values
```

Apply the infrastructure:

```bash
terraform apply
```

Note the outputs — you'll need `ecr_repository_url`, `cloudfront_distribution_id`, and `ec2_instance_id`.

### 2. Deploy Backend

Build and push the Docker image to ECR:

```bash
cd backend

# Authenticate Docker with ECR
aws ecr get-login-password --region us-west-1 | \
  docker login --username AWS --password-stdin $(terraform -chdir=../infra output -raw ecr_repository_url | cut -d/ -f1)

# Build, tag, and push
docker build -t logos-backend .
docker tag logos-backend:latest $(terraform -chdir=../infra output -raw ecr_repository_url):latest
docker push $(terraform -chdir=../infra output -raw ecr_repository_url):latest
```

Then reboot the EC2 instance so it pulls the new image:

```bash
aws ec2 reboot-instances --instance-ids $(terraform -chdir=../infra output -raw ec2_instance_id)
```

Verify after a couple minutes:

```bash
curl https://api.philo-ai.com/
```

### 3. Deploy Frontend

Build and upload to S3:

```bash
cd frontend

VITE_BACKEND_URL=https://api.philo-ai.com \
VITE_SUPABASE_URL=<your-supabase-url> \
VITE_SUPABASE_KEY=<your-supabase-anon-key> \
  npm run build

aws s3 sync dist/ s3://logos-frontend-prod --delete
```

Invalidate the CloudFront cache:

```bash
aws cloudfront create-invalidation \
  --distribution-id $(terraform -chdir=../infra output -raw cloudfront_distribution_id) \
  --paths "/*"
```

Verify:

```bash
curl https://logos.philo-ai.com
```

### Subsequent Deployments

After the initial setup, you only need to repeat steps 2 and/or 3 when pushing code changes. No need to re-run Terraform unless infrastructure changes.

**Backend update:**
```bash
cd backend
docker build -t logos-backend .
docker tag logos-backend:latest <ECR_URL>:latest
docker push <ECR_URL>:latest
aws ec2 reboot-instances --instance-ids <INSTANCE_ID>
```

**Frontend update:**
```bash
cd frontend
VITE_BACKEND_URL=https://api.philo-ai.com npm run build
aws s3 sync dist/ s3://logos-frontend-prod --delete
aws cloudfront create-invalidation --distribution-id <DISTRIBUTION_ID> --paths "/*"
```

### SSH into EC2

```bash
ssh -i ~/.ssh/id_ed25519 ec2-user@$(terraform -chdir=infra output -raw ec2_public_ip)
```

Useful commands on the instance:

```bash
docker ps                           # Check running containers
docker logs logos-backend            # View app logs
cat /var/log/user-data.log           # View bootstrap script logs
sudo systemctl status caddy          # Check Caddy status
```
