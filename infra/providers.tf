terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Frontend S3 bucket in us-west-1
provider "aws" {
  alias  = "us_west_1"
  region = "us-west-1"
}

# CloudFront requires ACM certificates in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
