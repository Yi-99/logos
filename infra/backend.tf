# Uncomment after running: cd bootstrap && terraform apply
#
# terraform {
#   backend "s3" {
#     bucket         = "logos-terraform-state"
#     key            = "logos/terraform.tfstate"
#     region         = "us-west-1"
#     dynamodb_table = "logos-terraform-locks"
#     encrypt        = true
#   }
# }
