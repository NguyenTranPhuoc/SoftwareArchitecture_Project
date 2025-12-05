# Quick Deployment Steps

## On Your Local Machine

1. **Commit and push deployment files:**
```powershell
cd "F:\14_CaoHoc\Ky2\Kiến trúc phần mềm\Zola2\zalo-clone"
git add .
git commit -m "Add production deployment configuration"
git push origin main
```

## On Your GCP VM

2. **SSH into your VM:**
```bash
gcloud compute ssh YOUR_VM_NAME --zone=YOUR_ZONE
```

3. **Clone or pull the repository:**
```bash
# If first time:
cd ~
git clone https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git
cd SoftwareArchitecture_Project/zalo-clone

# If already cloned:
cd ~/SoftwareArchitecture_Project/zalo-clone
git pull origin main
```

4. **Make deploy script executable:**
```bash
chmod +x deploy.sh
```

5. **Run the deployment:**
```bash
./deploy.sh
```

That's it! The script will automatically:
- Get your VM's IP address
- Update all environment variables
- Build the frontend
- Build and start all Docker containers
- Show you the access URLs

## Access Your Application

After deployment, you can access:
- **Frontend**: `http://34.124.227.173:3000`
- **Backend**: `http://34.124.227.173:6000`
- **Auth Service**: `http://34.124.227.173:3001`
- **User Service**: `http://34.124.227.173:3002`

## Troubleshooting

If something goes wrong:

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Check auth services
cd src/auth-user-monorepo
docker-compose logs -f

# Restart everything
cd ~/SoftwareArchitecture_Project/zalo-clone
./deploy.sh
```

## Open Firewall (if not done already)

```bash
gcloud compute firewall-rules create allow-zalo-clone \
  --allow tcp:3000,tcp:3001,tcp:3002,tcp:6000 \
  --source-ranges 0.0.0.0/0 \
  --description "Zalo Clone application ports"
```
