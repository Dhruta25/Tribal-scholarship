variable "aws_region" {
  type        = string
  description = "AWS Region to deploy the platform"
  default     = "ap-south-1"
}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "production"
}

variable "project_name" {
  type        = string
  description = "Project name used for tagging and resource naming"
  default     = "tribal-scholarship"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type (t3.micro: Free Tier $0.00/mo, t3.small: 2 vCPU/2GB RAM ~$7.50/mo, t4g.small: ARM64 ~$6.00/mo)"
  default     = "t3.small"
}

variable "volume_size" {
  type        = number
  description = "EBS Root Volume size in GB (gp3 SSD)"
  default     = 20
}

variable "github_repo_url" {
  type        = string
  description = "GitHub repository URL to clone on the server"
  default     = "https://github.com/Dhruta25/Tribal-scholarship.git"
}

variable "mongodb_uri" {
  type        = string
  description = "MongoDB Atlas Connection URI"
  default     = ""
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "JWT Secret for Authentication"
  default     = "mota_scholarship_jwt_key_2026"
  sensitive   = true
}

variable "gemini_api_key" {
  type        = string
  description = "Google Gemini API key for AI assistant features"
  default     = ""
  sensitive   = true
}
