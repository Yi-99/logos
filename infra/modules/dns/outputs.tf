output "apex_fqdn" {
  description = "Apex domain FQDN"
  value       = aws_route53_record.apex.fqdn
}

output "www_fqdn" {
  description = "www subdomain FQDN"
  value       = aws_route53_record.www.fqdn
}

output "api_fqdn" {
  description = "API subdomain FQDN"
  value       = aws_route53_record.api.fqdn
}
