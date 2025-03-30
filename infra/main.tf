terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.81.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "2.7.0"
    }
  }

  required_version = ">= 1.10"

  backend "s3" {
    bucket       = "hunko-course-tf"
    region       = "eu-central-1"
    key          = "state"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region
}

data "aws_caller_identity" "current_acc" {}
