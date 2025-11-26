// src/hooks/useChatSocket.ts
import { useEffect, useRef, useCallback } from "react";
import { useChatStore } from "../store/chatStore";
import type { Message } from "../store/chatStore";

export type OutgoingMessage =
  | { type: "auth"; userId: string }
  | { type: "message:send"; conversationId: string; content: string }
  | {
      type: "message:send:file";
      conversationId: string;
      content: string;
      messageType: "image" | "file";
      fileMetadata: {
        filename: string;
        size: number;
        mimeType: string;
        url: string;
        thumbnailUrl?: string;
      };
    }
  | { type: "message:recall"; messageId: string }
  | { type: "message:delete:me"; messageId: string }
  | {
      type: "message:send";
      conversationId: string;
      content: string;
      replyTo?: string;
    }
  | { type: "message:react"; messageId: string; emoji: string };

export function useChatSocket() {
  const me = useChatStore((s) => s.me);
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "auth",
          userId: me.id,
        } as OutgoingMessage)
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message:new") {
          const msg: Message = {
            id: data.id,
            conversationId: data.conversationId,
            senderId: data.senderId,
            content: data.content,
            type: data.messageType || "text",
            createdAt: data.createdAt,
            isOwn: data.senderId === me.id,
            fileMetadata: data.fileMetadata
              ? {
                  filename: data.fileMetadata.filename,
                  size: data.fileMetadata.size,
                  mimeType: data.fileMetadata.mimeType,
                  url: data.fileMetadata.url,
                  thumbnailUrl: data.fileMetadata.thumbnailUrl,
                  isOnCloud: true,
                  isUploading: false,
                  uploadProgress: 100,
                }
              : undefined,
          };

          // Only include replyTo if it exists in the server response
          if (data.replyTo) {
            msg.replyTo = data.replyTo;
          }

          receiveMessage(msg);
        }
      } catch (err) {
        console.error("Invalid ws message", err);
      }
    };

    ws.onerror = (event) => {
      // nếu socket đã CLOSED do unmount / reload thì bỏ qua
      if (ws.readyState === WebSocket.CLOSED) {
        return;
      }
      console.error("WS error", event);
    };

    ws.onclose = (event) => {
      console.log("WS closed", event.code, event.reason);
    };

    return () => {
      ws.close();
    };
  }, [me.id, receiveMessage]);

  const sendWSMessage = useCallback((payload: OutgoingMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WS not ready");
      return;
    }
    ws.send(JSON.stringify(payload));
  }, []);

  return { sendWSMessage };
}
