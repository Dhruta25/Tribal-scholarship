#!/bin/bash
set -e

echo "========================================================"
echo " 🏛️  MoTA Tribal Scholarship AWS Terraform Deployment"
echo "========================================================"

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required but not installed."; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo "Terraform is required but not installed."; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$ROOT_DIR/terraform"

cd "$TERRAFORM_DIR"
terraform init
terraform apply -auto-approve

echo "========================================================"
echo " 🎉 Infrastructure Provisioned Successfully!"
echo "========================================================"
terraform output
