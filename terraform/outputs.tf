# ==============================================================================
# Terraform Outputs
# ==============================================================================

output "server_public_ip" {
  description = "Public Elastic IP address of the server"
  value       = aws_eip.server_ip.public_ip
}

output "app_url" {
  description = "Public HTTP URL to access the MoTA Scholarship Platform"
  value       = "http://${aws_eip.server_ip.public_ip}"
}

output "api_health_url" {
  description = "API Health Check endpoint"
  value       = "http://${aws_eip.server_ip.public_ip}/api/health"
}

output "instance_id" {
  description = "EC2 Instance ID for AWS Systems Manager and monitoring"
  value       = aws_instance.server.id
}

output "ssm_connect_command" {
  description = "AWS CLI command to connect to terminal session without SSH keys"
  value       = "aws ssm start-session --target ${aws_instance.server.id} --region ${var.aws_region}"
}

output "cloudflared_quick_url_command" {
  description = "Command to inspect Cloudflare Tunnel logs for a free HTTPS link"
  value       = "aws ssm send-command --instance-ids ${aws_instance.server.id} --document-name 'AWS-RunShellScript' --parameters 'commands=[\"docker logs mota_scholarship_cloudflared 2>&1 | grep -o \\\"https://.*\\.trycloudflare\\.com\\\" | tail -n 1\"]' --region ${var.aws_region}"
}
