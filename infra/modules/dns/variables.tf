variable "domain_name" {
  description = "Root domain name"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}

variable "app_name" {
  description = "App subdomain name"
  type        = string
  default     = "who"
}

variable "backend_eip" {
  description = "Backend Elastic IP address"
  type        = string
}
