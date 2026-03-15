resource "aws_s3_bucket" "portraits" {
  bucket = "${var.app_name}-portraits-${var.environment}"

  tags = {
    Name        = "${var.app_name}-portraits"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "portraits" {
  bucket = aws_s3_bucket.portraits.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "portraits" {
  bucket = aws_s3_bucket.portraits.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "portraits" {
  bucket = aws_s3_bucket.portraits.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "portraits_public_read" {
  bucket = aws_s3_bucket.portraits.id

  depends_on = [aws_s3_bucket_public_access_block.portraits]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.portraits.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "portraits" {
  bucket = aws_s3_bucket.portraits.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3600
  }
}
