# ==============================================================================
# Amazon EC2 Instance & Elastic IP Configuration (Ultra Low-Cost <$5-$8/mo)
# ==============================================================================

# Look up latest official Ubuntu 24.04 LTS AMI in the target region
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance
resource "aws_instance" "server" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = var.instance_type
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.web.id]

  root_block_device {
    volume_size           = var.volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.project_name}-root-ebs"
    }
  }

  user_data = <<-EOF
#!/bin/bash
set -e

              # 0. Configure 2GB Swap Space to ensure smooth Docker builds on budget instances
              if [ ! -f /swapfile ]; then
                fallocate -l 2G /swapfile
                chmod 600 /swapfile
                mkswap /swapfile
                swapon /swapfile
                echo '/swapfile none swap sw 0 0' >> /etc/fstab
              fi

              # 1. Update and install Docker & Git
              apt-get update -y
              apt-get install -y ca-certificates curl gnupg git

              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
              chmod a+r /etc/apt/keyrings/docker.asc

              echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
                $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
                tee /etc/apt/sources.list.d/docker.list > /dev/null

              apt-get update -y
              apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

              systemctl enable docker
              systemctl start docker

              # 2. Clone repository
              mkdir -p /opt/tribal-scholarship
              cd /opt/tribal-scholarship
              git clone ${var.github_repo_url} . || git pull origin main || true

              # 3. Write Backend Dockerfile
              mkdir -p server
              cat << 'DOCKER_SERVER' > server/Dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv curl build-essential \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
RUN pip install --no-cache-dir numpy pandas scikit-learn joblib
COPY server/ ./server/
COPY ml/ ./ml/
WORKDIR /app/server
EXPOSE 5001
CMD ["node", "src/server.js"]
DOCKER_SERVER

              # 4. Write Frontend Dockerfile and Nginx configuration
              mkdir -p client
              cat << 'DOCKER_CLIENT' > client/Dockerfile.prod
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=\$VITE_API_URL
ARG GEMINI_API_KEY=""
ENV VITE_GEMINI_API_KEY=\$GEMINI_API_KEY
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
DOCKER_CLIENT

              cat << 'NGINX_CLIENT' > client/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $$uri $$uri/ /index.html;
    }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    error_page 404 /index.html;
}
NGINX_CLIENT

              # 5. Write Gateway Nginx Reverse Proxy Config
              mkdir -p nginx
              cat << 'NGINX_GATEWAY' > nginx/nginx.conf
events {
    worker_connections 1024;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml application/json image/svg+xml;

    upstream backend_api {
        server backend:5001;
    }
    upstream frontend_app {
        server frontend:80;
    }

    server {
        listen 80 default_server;
        server_name _;
        client_max_body_size 25M;

        location /api/ {
            proxy_pass http://backend_api;
            proxy_http_version 1.1;
            proxy_set_header Host $$host;
            proxy_set_header X-Real-IP $$remote_addr;
            proxy_set_header X-Forwarded-For $$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $$scheme;
            proxy_read_timeout 120s;
        }

        location /uploads/ {
            proxy_pass http://backend_api;
            proxy_http_version 1.1;
            proxy_set_header Host $$host;
            proxy_set_header X-Real-IP $$remote_addr;
            proxy_set_header X-Forwarded-For $$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $$scheme;
        }

        location / {
            proxy_pass http://frontend_app;
            proxy_http_version 1.1;
            proxy_set_header Host $$host;
            proxy_set_header X-Real-IP $$remote_addr;
            proxy_set_header X-Forwarded-For $$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $$scheme;
        }

        location /healthz {
            access_log off;
            return 200 "OK\n";
        }
    }
}
NGINX_GATEWAY

              # 6. Write Production Docker Compose
              cat << 'COMPOSE_FILE' > docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: server/Dockerfile
    container_name: mota_scholarship_backend
    restart: always
    environment:
      - PORT=5001
      - NODE_ENV=production
      - MONGODB_URI=$${MONGODB_URI}
      - JWT_SECRET=$${JWT_SECRET}
      - JWT_EXPIRE=7d
      - CLIENT_URL=$${CLIENT_URL:-http://localhost}
      - GEMINI_API_KEY=$${GEMINI_API_KEY}
    networks:
      - mota_net

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.prod
      args:
        - VITE_API_URL=/api
        - GEMINI_API_KEY=$${GEMINI_API_KEY}
    container_name: mota_scholarship_frontend
    restart: always
    networks:
      - mota_net

  nginx:
    image: nginx:1.27-alpine
    container_name: mota_scholarship_nginx
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend
    networks:
      - mota_net

  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: mota_scholarship_cloudflared
    restart: always
    command: tunnel --url http://nginx:80
    depends_on:
      - nginx
    networks:
      - mota_net

networks:
  mota_net:
    driver: bridge
COMPOSE_FILE

              # 7. Write Environment Variables for Docker Compose
              cat << ENVFILE > .env
PORT=5001
NODE_ENV=production
MONGODB_URI=${var.mongodb_uri}
JWT_SECRET=${var.jwt_secret}
JWT_EXPIRE=7d
CLIENT_URL=http://localhost
GEMINI_API_KEY=${var.gemini_api_key}
ENVFILE

              # Also write .env into server/ directory
              cp .env server/.env

              # 8. Build and start production stack
              docker compose -f docker-compose.prod.yml up -d --build

              # 9. Configure systemd unit for automatic startup on reboot
              cat << 'SERVICEFILE' > /etc/systemd/system/tribal-scholarship.service
[Unit]
Description=MoTA Tribal Scholarship Platform Docker Compose Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/tribal-scholarship
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down

[Install]
WantedBy=multi-user.target
SERVICEFILE

              systemctl daemon-reload
              systemctl enable tribal-scholarship.service
              EOF

  tags = {
    Name    = "${var.project_name}-${var.environment}-server"
    Project = var.project_name
  }
}

# Static Public Elastic IP attached to the instance
resource "aws_eip" "server_ip" {
  instance = aws_instance.server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-${var.environment}-eip"
  }
}
