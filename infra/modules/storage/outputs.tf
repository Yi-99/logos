output "portraits_bucket_name" {
  description = "Name of the S3 bucket for philosopher portraits"
  value       = aws_s3_bucket.portraits.bucket
}

output "portraits_bucket_arn" {
  description = "ARN of the S3 portraits bucket"
  value       = aws_s3_bucket.portraits.arn
}

output "portraits_bucket_domain" {
  description = "Regional domain name of the S3 portraits bucket"
  value       = aws_s3_bucket.portraits.bucket_regional_domain_name
}
