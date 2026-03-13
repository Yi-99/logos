output "apex_fqdn" {
  description = "Apex domain FQDN"
  value       = aws_route53_record.apex.fqdn
}

output "app_fqdn" {
  description = "App subdomain FQDN"
  value       = aws_route53_record.app.fqdn
}

output "api_fqdn" {
  description = "API subdomain FQDN"
  value       = aws_route53_record.api.fqdn
}
