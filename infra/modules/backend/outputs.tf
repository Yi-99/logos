output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.backend.id
}

output "eip_public_ip" {
  description = "Elastic IP public address"
  value       = aws_eip.backend.public_ip
}

output "security_group_id" {
  description = "Backend security group ID"
  value       = aws_security_group.backend.id
}
