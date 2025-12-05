# API Test Frontend

A simple, standalone HTML page to test the Zalo Clone backend API.

## Features

- **Server Status Monitoring**: Real-time server health check
- **Quick API Tests**: One-click testing of common endpoints
- **WebSocket Testing**: Connect and send events via Socket.IO
- **Custom Requests**: Send custom HTTP requests to any endpoint
- **Response Viewer**: Pretty-printed JSON responses
- **Visual Feedback**: Color-coded status indicators and request methods

## How to Use

### Method 1: Direct File Opening (Simplest)

1. Make sure your backend server is running:
   ```bash
   npm run dev:server
   ```

2. Open `index.html` directly in your browser:
   - Double-click the file, or
   - Right-click and select "Open with" > Your browser

### Method 2: Using a Local Server (Recommended)

If you encounter CORS issues with Method 1, use a local server:

**Using Python:**
```bash
# Navigate to the project root
cd SoftwareArchitecture_Project

# Start Python server
python -m http.server 3000

# Open browser to: http://localhost:3000/src/test-frontend/
```

**Using Node.js http-server:**
```bash
# Install http-server globally (one-time)
npm install -g http-server

# Navigate to the project root
cd SoftwareArchitecture_Project

# Start server
http-server -p 3000

# Open browser to: http://localhost:3000/src/test-frontend/
```

**Using VS Code Live Server Extension:**
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Testing Endpoints

### Quick Tests

1. **Test Health**: Checks if the server is running
   - Endpoint: `GET /health`
   - Returns: Server status and uptime

2. **Test API Info**: Gets list of available endpoints
   - Endpoint: `GET /api`
   - Returns: API version and endpoint list

3. **Test Conversations**: Tests the conversations endpoint
   - Endpoint: `GET /api/conversations`
   - Returns: List of conversations (or placeholder response)

4. **Test Messages**: Tests the messages endpoint
   - Endpoint: `GET /api/messages`
   - Returns: List of messages (or placeholder response)

### Custom Requests

Use the "Custom Request" section to:
1. Enter any endpoint path (e.g., `/api/users`)
2. Select HTTP method (GET, POST, PUT, DELETE)
3. Add request body for POST/PUT requests (JSON format)
4. Click "Send Request"

### WebSocket Testing

1. Click "Connect" to establish WebSocket connection
2. Enter an event name (e.g., `chat-message`)
3. Enter event data as JSON:
   ```json
   {
     "message": "Hello World",
     "userId": "123"
   }
   ```
4. Click "Send Event"
5. Watch for responses in the WebSocket response area

## Expected Behavior

### When Server is Running
- Green dot next to "Server: Online"
- Quick tests return JSON responses
- WebSocket connection succeeds

### When Server is Offline
- Red dot next to "Server: Offline"
- Requests will fail with connection errors
- WebSocket cannot connect

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:**
1. Make sure the backend server is running on port 5000
2. Check that CORS is configured in `.env`:
   ```env
   CORS_ORIGIN=http://localhost:3000,http://localhost:3001
   ```
3. If using a different port, update the `API_BASE` constant in `index.html`:
   ```javascript
   const API_BASE = 'http://localhost:YOUR_PORT';
   ```

### Issue: WebSocket won't connect

**Solution:**
1. Verify Socket.IO is initialized in `server.ts`
2. Check browser console for error messages
3. Ensure CORS origins include your test page's URL

### Issue: Endpoints return 404

**Solution:**
1. Check that the route handlers are registered in `server.ts`
2. Verify the endpoint path is correct
3. Check server console for request logs

## API Server Configuration

The test frontend expects the backend server to be running at:
```
http://localhost:5000
```

If your server runs on a different port, update line 306 in `index.html`:
```javascript
const API_BASE = 'http://localhost:YOUR_PORT';
```

## Browser Compatibility

This test client works in all modern browsers:
- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera

JavaScript and WebSocket support required.

## Next Steps

After verifying the API works:
1. Implement authentication endpoints
2. Test user registration and login
3. Create real conversations and messages
4. Build the production React frontend

## Development Tips

- Open browser DevTools (F12) to see detailed network requests
- Use the Console tab to debug JavaScript errors
- Check the Network tab to see HTTP requests and responses
- Monitor the WebSocket frames in the Network tab

---

For questions about the backend API, see the main project documentation:
- `SETUP.md` - Setup instructions
- `CLAUDE.md` - Architecture and development guidelines
- `README.md` - Project overview
