output "frontend_bucket_name" {
  description = "S3 bucket for frontend static files"
  value       = module.frontend.bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = module.frontend.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.frontend.cloudfront_domain_name
}

output "ecr_repository_url" {
  description = "ECR repository URL for backend Docker images"
  value       = module.backend.ecr_repository_url
}

output "ec2_public_ip" {
  description = "EC2 Elastic IP address"
  value       = module.backend.eip_public_ip
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = module.backend.instance_id
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "https://${var.domain_name}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "https://api.${var.domain_name}"
}

output "portraits_bucket_name" {
  description = "S3 bucket for philosopher portrait images"
  value       = module.storage.portraits_bucket_name
}

output "portraits_bucket_domain" {
  description = "Domain name for the portraits S3 bucket"
  value       = module.storage.portraits_bucket_domain
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.auth.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito App Client ID (for frontend)"
  value       = module.auth.client_id
}

output "cognito_hosted_ui_domain" {
  description = "Cognito Hosted UI domain"
  value       = module.auth.hosted_ui_domain
}
