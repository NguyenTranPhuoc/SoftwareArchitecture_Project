// server.js
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });

console.log("🚀 WebSocket server running on ws://localhost:3001");

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw);

      // Handle authentication (optional)
      if (data.type === "auth") {
        ws.userId = data.userId;
        console.log(`User authenticated: ${ws.userId}`);
        return;
      }

      // Handle sending text message
      if (data.type === "message:send") {
        const msg = {
          type: "message:new",
          id: cryptoRandomId(),
          conversationId: data.conversationId,
          senderId: ws.userId,
          content: data.content,
          messageType: "text",
          createdAt: new Date().toISOString(),
        };

        // Only include replyTo if it exists and is not empty
        if (data.replyTo) {
          msg.replyTo = data.replyTo;
        }

        console.log("Broadcast message:", data);

        // broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
      }

      // Handle sending file/image message
      if (data.type === "message:send:file") {
        const msg = {
          type: "message:new",
          id: cryptoRandomId(),
          conversationId: data.conversationId,
          senderId: ws.userId,
          content: data.content,
          messageType: data.messageType, // "image" or "file"
          fileMetadata: data.fileMetadata,
          createdAt: new Date().toISOString(),
        };

        console.log("Broadcast file message:", msg);

        // broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
          }
        });
      }
    } catch (err) {
      console.error("Invalid WS message", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

function cryptoRandomId() {
  return Math.random().toString(36).substring(2, 10);
}
