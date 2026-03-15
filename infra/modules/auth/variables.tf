variable "app_name" {
  description = "Application name"
  type        = string
  default     = "who"
}

variable "domain_name" {
  description = "Root domain name (used for callback URLs)"
  type        = string
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

variable "callback_urls" {
  description = "Allowed OAuth callback URLs"
  type        = list(string)
}

variable "logout_urls" {
  description = "Allowed logout URLs"
  type        = list(string)
}
