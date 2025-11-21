# Displaying Images in Chat - Zalo Style Implementation Guide

## Overview
This guide explains how to display uploaded images in your chat interface, similar to Zalo's chat functionality.

## Flow Diagram

```
User selects image -> Upload to GCS -> Get URL -> Send via Socket.IO -> Display in chat
```

## Step-by-Step Implementation

### Step 1: Create Chat Component Structure

```typescript
// src/client/components/Chat/ChatBox.tsx
import React, { useState, useRef, useEffect } from 'react';
import { socket } from '../../utils/socket';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  isSent?: boolean;
}

export const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle received messages via Socket.IO
  useEffect(() => {
    socket.on('receive-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('receive-message');
    };
  }, []);

  return (
    <div className="chat-box">
      <ChatMessages messages={messages} />
      <ChatInput 
        onSendText={handleSendText}
        onSendImage={handleSendImage}
        uploading={uploading}
      />
    </div>
  );
};
```

### Step 2: Image Upload Handler

```typescript
// src/client/utils/uploadImage.ts
const API_BASE = 'http://34.124.227.173:5000/api/chat';

export const uploadChatImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_BASE}/image`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.imageUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};
```

### Step 3: Chat Input Component

```typescript
// src/client/components/Chat/ChatInput.tsx
import React, { useRef, useState } from 'react';
import { uploadChatImage } from '../../utils/uploadImage';

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendImage: (imageUrl: string, caption?: string) => void;
  uploading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendText, 
  onSendImage, 
  uploading 
}) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim()) {
      onSendText(text);
      setText('');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload image to GCS
      const imageUrl = await uploadChatImage(file);
      
      // Send image message
      onSendImage(imageUrl, text);
      setText('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Failed to upload image');
    }
  };

  return (
    <div className="chat-input-container">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        Attach Image
      </button>
      
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
        disabled={uploading}
      />
      
      <button onClick={handleSend} disabled={uploading}>
        Send
      </button>
      
      {uploading && <div className="uploading">Uploading...</div>}
    </div>
  );
};
```

### Step 4: Message Display Component

```typescript
// src/client/components/Chat/ChatMessages.tsx
import React, { useState } from 'react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  isSent?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  currentUserId 
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <div className="chat-messages">
      {messages.map((message) => {
        const isSent = message.senderId === currentUserId;
        
        return (
          <div 
            key={message.id} 
            className={`message ${isSent ? 'sent' : 'received'}`}
          >
            {!isSent && (
              <div className="sender-name">{message.senderName}</div>
            )}
            
            <div className="message-bubble">
              {message.content && (
                <div className="message-text">{message.content}</div>
              )}
              
              {message.imageUrl && (
                <img 
                  src={message.imageUrl} 
                  alt="Chat image"
                  className="message-image"
                  onClick={() => setLightboxImage(message.imageUrl)}
                />
              )}
              
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        );
      })}
      
      {lightboxImage && (
        <Lightbox 
          imageUrl={lightboxImage} 
          onClose={() => setLightboxImage(null)} 
        />
      )}
    </div>
  );
};
```

### Step 5: Socket.IO Integration

```typescript
// src/client/utils/socket.ts
import { io } from 'socket.io-client';

export const socket = io('http://34.124.227.173:5000', {
  autoConnect: false,
});

// Connect when user logs in
export const connectSocket = (userId: string) => {
  socket.auth = { userId };
  socket.connect();
};

// Send text message
export const sendTextMessage = (conversationId: string, text: string) => {
  socket.emit('send-message', {
    conversationId,
    type: 'text',
    content: text,
  });
};

// Send image message
export const sendImageMessage = (
  conversationId: string, 
  imageUrl: string, 
  caption?: string
) => {
  socket.emit('send-message', {
    conversationId,
    type: 'image',
    content: caption || '',
    imageUrl: imageUrl,
  });
};
```

### Step 6: CSS Styling (Zalo-like)

```css
/* src/client/styles/chat.css */

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f0f2f5;
}

.message {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-end;
}

.message.sent {
  justify-content: flex-end;
}

.message.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 60%;
  padding: 8px 12px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message.sent .message-bubble {
  background: #0084ff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.received .message-bubble {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 12px;
  margin-top: 4px;
  cursor: pointer;
  display: block;
}

.message.sent .message-image {
  border-bottom-right-radius: 4px;
}

.message.received .message-image {
  border-bottom-left-radius: 4px;
}

.message-text {
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  margin-top: 4px;
  opacity: 0.7;
}

.uploading {
  padding: 8px 12px;
  background: #fff3cd;
  border-radius: 8px;
  font-size: 13px;
  color: #856404;
  margin: 8px;
}
```

### Step 7: Backend Socket.IO Handler

```typescript
// src/server/server.ts (add to Socket.IO connection handler)

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join conversation rooms
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(conversationId);
  });

  // Handle send message
  socket.on('send-message', async (data) => {
    const { conversationId, type, content, imageUrl } = data;
    
    // Save message to database
    const message = {
      id: generateId(),
      conversationId,
      senderId: socket.data.userId,
      senderName: socket.data.userName,
      type,
      content,
      imageUrl,
      timestamp: new Date(),
    };
    
    // Broadcast to conversation participants
    io.to(conversationId).emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
```

## Complete Flow Example

### 1. User Clicks Attach Button
```typescript
// User clicks "+" button
<button onClick={() => fileInputRef.current?.click()}>
  Attach Image
</button>
```

### 2. Upload Image to GCS
```typescript
const imageUrl = await uploadChatImage(file);
// Returns: "https://storage.googleapis.com/zola-uploads-2470576/chat-images/..."
```

### 3. Send Message via Socket.IO
```typescript
socket.emit('send-message', {
  conversationId: 'conv123',
  type: 'image',
  content: 'Check this out!',
  imageUrl: imageUrl
});
```

### 4. Backend Broadcasts to Recipients
```typescript
io.to(conversationId).emit('receive-message', {
  id: 'msg123',
  senderId: 'user1',
  type: 'image',
  imageUrl: imageUrl,
  timestamp: new Date()
});
```

### 5. Display in Chat UI
```typescript
// Message renders with image
<div className="message sent">
  <div className="message-bubble">
    <img src={imageUrl} className="message-image" />
  </div>
</div>
```

## Key Features

1. **Image Upload**: Upload to GCS before sending
2. **Real-time Display**: Show via Socket.IO
3. **Loading State**: Show uploading indicator
4. **Lightbox**: Click to view full size
5. **Captions**: Optional text with images
6. **Responsive**: Images scale to fit container
7. **Timestamps**: Show when message was sent

## Testing

1. Open `chat-demo.html` in your browser
2. Click "+" button to select image
3. Image uploads to GCS
4. Image displays in chat bubble
5. Click image to view full size

## Production Considerations

1. **Compression**: Compress images before upload
2. **Thumbnails**: Generate thumbnails for faster loading
3. **Lazy Loading**: Load images as user scrolls
4. **Error Handling**: Handle upload failures gracefully
5. **Progress**: Show upload progress bar
6. **Multiple Images**: Support sending albums
7. **Image Preview**: Preview before sending
8. **Cancel Upload**: Allow canceling uploads

## Next Steps

1. Implement image compression
2. Add thumbnail generation
3. Support multiple image selection
4. Add image editing (crop, rotate)
5. Implement image caching
6. Add download button
7. Support video messages
