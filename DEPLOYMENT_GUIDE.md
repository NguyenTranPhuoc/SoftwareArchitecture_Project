# Zalo Clone - GCP Deployment Guide

## Prerequisites

- GCP VM with Docker and Docker Compose installed
- VM with at least 4GB RAM
- Firewall rules allowing ports: 80, 443, 3000, 3001, 3002, 6000

## Step 1: Prepare Your VM

```bash
# SSH into your GCP VM
gcloud compute ssh YOUR_VM_NAME --zone=YOUR_ZONE

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not already installed)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect
exit
```

## Step 2: Upload Project to VM

### Option A: Using Git (Recommended)
```bash
# On your VM
cd ~
git clone https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git
cd SoftwareArchitecture_Project/zalo-clone
```

### Option B: Using SCP from Local Machine
```bash
# On your local machine (PowerShell)
cd "F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2"
gcloud compute scp --recurse zalo-clone YOUR_VM_NAME:~ --zone=YOUR_ZONE
```

## Step 3: Configure Environment Variables

```bash
# On your VM
cd ~/zalo-clone

# Get your VM's external IP
export VM_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
echo "Your VM IP: $VM_IP"

# Update .env file with VM IP
nano .env
# Change:
# - VITE_API_URL to http://YOUR_VM_IP:6000
# - VITE_AUTH_URL to http://YOUR_VM_IP:3001
# - VITE_USER_URL to http://YOUR_VM_IP:3002

# Update auth service .env
cd src/auth-user-monorepo
nano .env
# Update CORS_ALLOWED_ORIGINS to include http://YOUR_VM_IP:3000
```

## Step 4: Build Frontend

```bash
cd ~/zalo-clone/src/client/webapp
npm install
npm run build

# The build will be in dist/ folder
```

## Step 5: Create Production Docker Compose

See `docker-compose.prod.yml` file

## Step 6: Start Services

```bash
cd ~/zalo-clone

# Start main services
docker-compose -f docker-compose.prod.yml up -d

# Start auth services
cd src/auth-user-monorepo
docker-compose up -d

# Check all services are running
docker ps
```

## Step 7: Setup Nginx (Optional - for production)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/zalo-clone

# See nginx.conf example below

# Enable site
sudo ln -s /etc/nginx/sites-available/zalo-clone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Open Firewall Ports

```bash
# On GCP Console or using gcloud
gcloud compute firewall-rules create allow-zalo-clone \
  --allow tcp:80,tcp:443,tcp:3000,tcp:3001,tcp:3002,tcp:6000 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow Zalo Clone application ports"
```

## Step 9: Verify Deployment

```bash
# Check if services are running
curl http://localhost:6000/health
curl http://localhost:3001/auth/stats
curl http://localhost:3002/users/stats

# From your local machine
curl http://YOUR_VM_IP:6000/health
```

## Access Your Application

- **Frontend**: http://34.124.227.173:3000
- **Backend API**: http://34.124.227.173:6000
- **Auth Service**: http://34.124.227.173:3001
- **User Service**: http://34.124.227.173:3002

## Troubleshooting

### Check Logs
```bash
# Main services
docker-compose -f docker-compose.prod.yml logs -f

# Auth services
cd src/auth-user-monorepo
docker-compose logs -f
```

### Restart Services
```bash
docker-compose -f docker-compose.prod.yml restart
cd src/auth-user-monorepo && docker-compose restart
```

### Check Disk Space
```bash
df -h
docker system prune -a  # Clean up unused Docker resources
```

## Maintenance

### Update Application
```bash
cd ~/zalo-clone
git pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
# MongoDB
docker exec zalo_mongodb mongodump --out /backup

# PostgreSQL
docker exec zalo_postgres pg_dump -U postgres zalo_clone > backup.sql
docker exec auth-user-monorepo-postgres-1 pg_dump -U zalo_auth_user zalo_auth_db > auth_backup.sql
```
