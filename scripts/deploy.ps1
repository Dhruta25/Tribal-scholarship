<#
.SYNOPSIS
    Automated Deployment Script for MoTA Tribal Scholarship Platform on AWS with Terraform.
.DESCRIPTION
    1. Verifies AWS CLI and Terraform prerequisites.
    2. Initializes Terraform provider.
    3. Runs terraform apply to provision EC2, Security Groups, IAM, and Elastic IP.
    4. Automatically boots Docker stack on EC2 instance.
#>

param (
    [string]$AwsRegion = "ap-south-1",
    [string]$Environment = "production",
    [string]$ProjectName = "tribal-scholarship",
    [switch]$AutoApprove = $true
)

$ErrorActionPreference = "Stop"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " 🏛️  MoTA Tribal Scholarship AWS Terraform Deployment" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Check Prerequisites
Write-Host "`n[1/4] Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command "aws" -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI is required but not found in PATH."
}
if (-not (Get-Command "terraform" -ErrorAction SilentlyContinue)) {
    Write-Error "Terraform is required but not found in PATH."
}

# Verify AWS credentials
$callerIdentity = aws sts get-caller-identity | ConvertFrom-Json
$awsAccountId = $callerIdentity.Account
Write-Host "✓ AWS Account ID: $awsAccountId (Region: $AwsRegion)" -ForegroundColor Green

# 2. Terraform Initialization
Write-Host "`n[2/4] Initializing Terraform..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$terraformDir = Join-Path $rootDir "terraform"

Set-Location $terraformDir
terraform init

# 3. Terraform Apply Full Stack
Write-Host "`n[3/4] Provisioning infrastructure with Terraform..." -ForegroundColor Yellow
if ($AutoApprove) {
    terraform apply -auto-approve
} else {
    terraform apply
}

# 4. Output Results
Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " 🎉 Infrastructure Provisioned Successfully!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
terraform output
