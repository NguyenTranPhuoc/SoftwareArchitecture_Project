# Quick Fix for "Failed to Fetch" Error

## Problem
The HTML test page shows "Upload failed: Failed to fetch" error.

## Root Causes
1. CORS fix not deployed to VM
2. Chat routes not deployed to VM
3. Server not running or crashed

## Solution - Deploy Latest Code to VM

### Step 1: Connect to Your VM via SSH

In GCP Console:
1. Go to Compute Engine > VM Instances
2. Find "zola-server"
3. Click "SSH" button

### Step 2: Deploy Latest Code

Run these commands in your VM SSH terminal:

```bash
# Navigate to project directory
cd ~/SoftwareArchitecture_Project

# Pull latest code from GitHub
git pull origin main

# If git pull shows conflicts with package-lock.json:
git stash
git pull origin main

# Install dependencies (in case new ones were added)
npm install

# Build the TypeScript code
npm run build:server

# Restart the server with PM2
pm2 restart zola-backend

# Check server status
pm2 status

# View logs to verify no errors
pm2 logs zola-backend --lines 20
```

### Step 3: Verify Server is Running

Check if the server responds:

```bash
# Test from within VM
curl http://localhost:5000/health

# Should return JSON with success: true
```

### Step 4: Test Endpoints

```bash
# Test API info endpoint
curl http://localhost:5000/api

# Test chat upload info
curl http://localhost:5000/api/chat/info

# All should return JSON responses
```

### Step 5: Test from Your Browser

Open these URLs in your browser (replace with your actual IP):

1. Health check: http://34.124.227.173:5000/health
2. API info: http://34.124.227.173:5000/api
3. Chat info: http://34.124.227.173:5000/api/chat/info

All should return JSON. If they work, your HTML page should work too.

## If Still Getting Errors

### Check 1: Is Server Running?

```bash
# In VM SSH
pm2 status

# Should show "online" status
# If status is "errored", check logs:
pm2 logs zola-backend --lines 50
```

### Check 2: Common Errors in Logs

**Error: "Cannot find module 'express'"**
```bash
npm install
npm run build:server
pm2 restart zola-backend
```

**Error: "Address already in use"**
```bash
pm2 delete zola-backend
pm2 start dist/server.js --name zola-backend
```

**Error: "ECONNREFUSED" (Database connection)**
```bash
# This is OK - databases are optional
# Server should still start
# Check if .env has NODE_ENV=production
cat .env | grep NODE_ENV
```

### Check 3: Firewall Issue

```bash
# In VM SSH, check if port 5000 is open
sudo ufw status

# If 5000 is not listed, open it:
sudo ufw allow 5000
sudo ufw reload
```

Also verify GCP firewall rule exists:
1. Go to VPC Network > Firewall in GCP Console
2. Look for "allow-backend-5000" rule
3. If missing, create it:
   - Name: allow-backend-5000
   - Direction: Ingress
   - Targets: All instances
   - Source IPv4 ranges: 0.0.0.0/0
   - Protocols: tcp:5000

### Check 4: CORS Not Applied

If server is running but HTML page still fails:

```bash
# View the compiled server.ts to verify CORS fix
cat dist/server.js | grep -A 5 "cors"

# Should show: origin: '*' or similar
```

If CORS fix is not there:
```bash
# Pull latest code again
cd ~/SoftwareArchitecture_Project
git pull origin main
npm run build:server
pm2 restart zola-backend
```

## Quick Test Script

Save this as `test-api.sh` on your VM:

```bash
#!/bin/bash
echo "Testing Zola API..."
echo ""
echo "1. Health Check:"
curl -s http://localhost:5000/health | jq
echo ""
echo "2. API Info:"
curl -s http://localhost:5000/api | jq
echo ""
echo "3. Chat Upload Info:"
curl -s http://localhost:5000/api/chat/info | jq
echo ""
echo "4. Upload Test Info:"
curl -s http://localhost:5000/api/upload/info | jq
```

Run it:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Debugging CORS Issues

If you see CORS errors in browser console:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for errors like:
   - "Access-Control-Allow-Origin"
   - "CORS policy"

This means CORS fix is not deployed. Redeploy:

```bash
cd ~/SoftwareArchitecture_Project
git pull origin main
npm run build:server
pm2 restart zola-backend
pm2 logs zola-backend --lines 10
```

## Alternative: Test with cURL Instead

If HTML page still doesn't work, test upload directly with cURL:

```bash
# On your local Windows machine (PowerShell):
curl -X POST http://34.124.227.173:5000/api/chat/image -F "image=@C:\path\to\image.jpg"

# Should return JSON with imageUrl
```

## Check External IP Changed

Sometimes VM external IP changes after restart:

1. Go to Compute Engine > VM Instances
2. Check External IP of "zola-server"
3. If it changed, update HTML files with new IP

## Complete Redeployment (Last Resort)

If nothing works, do a complete redeployment:

```bash
# In VM SSH
cd ~
rm -rf SoftwareArchitecture_Project
git clone https://github.com/NguyenTranPhuoc/SoftwareArchitecture_Project.git
cd SoftwareArchitecture_Project
npm install
npm run build:server
pm2 delete zola-backend
pm2 start dist/server.js --name zola-backend
pm2 save
```

## Success Indicators

You know it's working when:

1. `pm2 status` shows "online"
2. `curl http://localhost:5000/health` returns JSON
3. Browser can access http://YOUR_IP:5000/health
4. Browser can access http://YOUR_IP:5000/api/chat/info
5. HTML page can upload images without "Failed to fetch"

## Still Not Working?

Share these details:

1. PM2 status: `pm2 status`
2. Last 20 log lines: `pm2 logs zola-backend --lines 20`
3. Server response: `curl http://localhost:5000/health`
4. Firewall status: `sudo ufw status`
5. External IP: Check in GCP Console
6. Browser error: Open F12 Developer Tools, check Console tab
