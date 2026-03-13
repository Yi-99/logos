variable "region" {
  description = "AWS region"
  type        = string
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for EC2 instance"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for EC2 instance"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID for security group"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key"
  type        = string
}

variable "allowed_cidr" {
  description = "CIDR block allowed to access EC2 (SSH, HTTP, HTTPS)"
  type        = string
}

variable "account_id" {
  description = "AWS account ID"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
}

variable "supabase_key" {
  description = "Supabase service role key"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "Frontend URL for CORS"
  type        = string
}

variable "app_name" {
  description = "App name"
  type        = string
  default     = "who"
}
