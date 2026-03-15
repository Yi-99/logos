variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-west-1"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "philo-ai.com"
}

variable "app_name" {
  description = "App subdomain name (e.g. 'www' or 'app')"
  type        = string
  default     = "who"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
}

variable "allowed_cidr" {
  description = "CIDR block allowed to access EC2 (SSH, HTTP, HTTPS)"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth 2.0 client ID"
  type        = string
}

variable "google_client_secret" {
  description = "Google OAuth 2.0 client secret"
  type        = string
  sensitive   = true
}
