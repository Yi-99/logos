data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_route53_zone" "main" {
  name = var.domain_name
}

data "aws_caller_identity" "current" {}

module "network" {
  source = "./modules/network"

  region = var.region
}

module "frontend" {
  source = "./modules/frontend"

  domain_name     = var.domain_name
  route53_zone_id = data.aws_route53_zone.main.zone_id

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }
}

module "backend" {
  source = "./modules/backend"

  region           = var.region
  domain_name      = var.domain_name
  ami_id           = data.aws_ami.amazon_linux.id
  subnet_id        = module.network.public_subnet_id
  vpc_id           = module.network.vpc_id
  ssh_public_key   = var.ssh_public_key
  ssh_allowed_cidr = var.ssh_allowed_cidr
  account_id       = data.aws_caller_identity.current.account_id
  openai_api_key   = var.openai_api_key
  supabase_url     = var.supabase_url
  supabase_key     = var.supabase_key
  frontend_url     = "https://${var.domain_name}"
}

module "dns" {
  source = "./modules/dns"

  domain_name                = var.domain_name
  route53_zone_id            = data.aws_route53_zone.main.zone_id
  cloudfront_domain_name     = module.frontend.cloudfront_domain_name
  cloudfront_hosted_zone_id  = module.frontend.cloudfront_hosted_zone_id
  backend_eip                = module.backend.eip_public_ip
}
