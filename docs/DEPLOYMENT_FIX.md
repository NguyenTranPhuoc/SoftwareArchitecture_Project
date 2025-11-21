# CORS Fix - Deployment Instructions

## What Changed:
The HTML test pages are now served by the server itself to avoid CORS errors.

## Deploy Now:

### 1. SSH into VM
Go to GCP Console > Compute Engine > VM Instances > Click SSH on "zola-server"

### 2. Run these commands:
```bash
cd ~/SoftwareArchitecture_Project
git pull origin main
npm run build:server
pm2 restart zola-backend
pm2 logs zola-backend --lines 10
```

### 3. Test the new URLs:

**Homepage:**
http://34.124.227.173:5000/

**Chat Demo:**
http://34.124.227.173:5000/chat-demo.html

**Upload Test:**
http://34.124.227.173:5000/chat-upload-test.html

## Why This Fixes CORS:

**Before (CORS error):**
- Open file directly: `file:///F:/chat-demo.html`
- Try to fetch: `http://34.124.227.173:5000/api/chat/image`
- Browser blocks: Different origins

**After (No CORS):**
- Open from server: `http://34.124.227.173:5000/chat-demo.html`
- Fetch from same server: `http://34.124.227.173:5000/api/chat/image`
- Browser allows: Same origin

## Test Upload:

1. Go to: http://34.124.227.173:5000/chat-demo.html
2. Click "+" button
3. Select image
4. Should upload and display successfully
5. No "Failed to fetch" error

Done!
