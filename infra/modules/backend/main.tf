# --- ECR Repository ---

resource "aws_ecr_repository" "backend" {
  name                 = "who-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "who-backend"
  }
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# --- SSM Parameter Store (Secrets) ---

resource "aws_ssm_parameter" "openai_api_key" {
  name  = "/who/OPENAI_API_KEY"
  type  = "SecureString"
  value = var.openai_api_key

  tags = {
    Name = "who-openai-api-key"
  }
}

resource "aws_ssm_parameter" "frontend_url" {
  name  = "/who/FRONTEND_URL"
  type  = "String"
  value = var.frontend_url

  tags = {
    Name = "${var.app_name}-frontend-url"
  }
}

# --- IAM Role for EC2 ---

resource "aws_iam_role" "ec2" {
  name = "who-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "who-ec2-role"
  }
}

resource "aws_iam_role_policy" "ec2" {
  name = "who-ec2-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECRAuth"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Sid    = "ECRPull"
        Effect = "Allow"
        Action = [
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchCheckLayerAvailability"
        ]
        Resource = aws_ecr_repository.backend.arn
      },
      {
        Sid    = "SSMRead"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:${var.region}:${var.account_id}:parameter/who/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "who-ec2-profile"
  role = aws_iam_role.ec2.name
}

# --- SSH Key Pair ---

resource "aws_key_pair" "deployer" {
  key_name   = "who-deployer"
  public_key = var.ssh_public_key
}

# --- Security Group ---

resource "aws_security_group" "backend" {
  name        = "who-backend-sg"
  description = "Security group for Who backend EC2"
  vpc_id      = var.vpc_id

  # SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  # HTTP (for Caddy redirect)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  # HTTPS (Caddy)
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  # Allow all outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "who-backend-sg"
  }
}

# --- Elastic IP ---

resource "aws_eip" "backend" {
  domain = "vpc"

  tags = {
    Name = "who-backend-eip"
  }
}

resource "aws_eip_association" "backend" {
  instance_id   = aws_instance.backend.id
  allocation_id = aws_eip.backend.id
}

# --- EC2 Instance ---

resource "aws_instance" "backend" {
  ami                    = var.ami_id
  instance_type          = "t3.micro"
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.backend.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  key_name               = aws_key_pair.deployer.key_name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    region      = var.region
    account_id  = var.account_id
    ecr_repo    = aws_ecr_repository.backend.repository_url
    domain_name = "api.${var.domain_name}"
  })

  tags = {
    Name = "who-backend"
  }
}
