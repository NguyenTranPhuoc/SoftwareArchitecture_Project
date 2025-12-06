import { Collection, ObjectId } from 'mongodb';
import { getMongoDB } from '../utils/database';

export interface IMessage {
  _id?: ObjectId;
  conversationId: ObjectId; // MongoDB conversation ID
  senderId: string; // User UUID from PostgreSQL
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'sticker' | 'location';
  fileUrl?: string; // For media messages (GCS bucket URL)
  fileName?: string; // For file messages
  fileSize?: number; // For file messages
  thumbnailUrl?: string; // Thumbnail for video/image
  replyTo?: ObjectId; // Message ID being replied to
  readBy: string[]; // Array of user UUIDs who have read the message
  reactions?: {
    emoji: string;
    userId: string; // User UUID from PostgreSQL
  }[];
  isEdited: boolean;
  editedAt?: Date; // Timestamp of last edit
  isDeleted: boolean;
  deletedAt?: Date; // Timestamp of deletion
  createdAt: Date;
  updatedAt: Date;
}

export class MessageModel {
  private collection?: Collection<IMessage>;

  private getCollection(): Collection<IMessage> {
    if (!this.collection) {
      const db = getMongoDB();
      this.collection = db.collection<IMessage>('messages');
    }
    return this.collection;
  }

  async createMessage(data: Omit<IMessage, '_id' | 'readBy' | 'isEdited' | 'isDeleted' | 'createdAt' | 'updatedAt'> | {
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'sticker' | 'location';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    thumbnailUrl?: string;
    replyTo?: string;
  }): Promise<IMessage> {
    // Convert conversationId string to ObjectId if needed
    const conversationId = typeof data.conversationId === 'string'
      ? new ObjectId(data.conversationId)
      : data.conversationId;
    const replyTo = data.replyTo
      ? (typeof data.replyTo === 'string' ? new ObjectId(data.replyTo) : data.replyTo)
      : undefined;

    const message: IMessage = {
      conversationId,
      senderId: data.senderId, // Keep as UUID string
      content: data.content,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      thumbnailUrl: data.thumbnailUrl,
      replyTo,
      readBy: [data.senderId], // Sender has read their own message
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.getCollection().insertOne(message);
    return {
      ...message,
      _id: result.insertedId,
    };
  }

  async findMessageById(messageId: string): Promise<IMessage | null> {
    return await this.getCollection().findOne({ _id: new ObjectId(messageId) });
  }

  async findMessagesByConversationId(
    conversationId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<IMessage[]> {
    return await this.getCollection()
      .find({ conversationId: new ObjectId(conversationId), isDeleted: false }) // ✅ Convert to ObjectId
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async findMessagesAfterTimestamp(
    conversationId: string,
    timestamp: Date
  ): Promise<IMessage[]> {
    return await this.getCollection()
      .find({
        conversationId: new ObjectId(conversationId), // ✅ Convert to ObjectId
        createdAt: { $gt: timestamp },
        isDeleted: false,
      })
      .sort({ createdAt: 1 })
      .toArray();
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<boolean> {
    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(messageId) },
      {
        $addToSet: { readBy: userId }, // Keep as UUID string
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async markConversationMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const result = await this.getCollection().updateMany(
      {
        conversationId: new ObjectId(conversationId),
        senderId: { $ne: userId }, // Don't mark own messages, use UUID string
        readBy: { $ne: userId }, // Only messages not already read, use UUID string
      },
      {
        $addToSet: { readBy: userId }, // Use UUID string
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount;
  }

  async updateMessage(messageId: string, content: string): Promise<boolean> {
    const now = new Date();
    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(messageId) },
      {
        $set: {
          content,
          isEdited: true,
          editedAt: now, // ✅ NEW: Track when message was edited
          updatedAt: now,
        },
      }
    );

    return result.modifiedCount > 0;
  }

  async deleteMessage(messageId: string, softDelete: boolean = true): Promise<boolean> {
    if (softDelete) {
      const now = new Date();
      const result = await this.getCollection().updateOne(
        { _id: new ObjectId(messageId) },
        {
          $set: {
            isDeleted: true,
            deletedAt: now, // ✅ NEW: Track when message was deleted
            content: 'This message has been deleted',
            updatedAt: now,
          },
        }
      );
      return result.modifiedCount > 0;
    } else {
      const result = await this.getCollection().deleteOne({ _id: new ObjectId(messageId) });
      return result.deletedCount > 0;
    }
  }

  async addReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(messageId) },
      {
        $push: {
          reactions: { emoji, userId }, // Keep as UUID string
        },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async removeReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    const result = await this.getCollection().updateOne(
      { _id: new ObjectId(messageId) },
      {
        $pull: {
          reactions: { emoji, userId }, // Keep as UUID string
        },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return await this.getCollection().countDocuments({
      conversationId: new ObjectId(conversationId),
      senderId: { $ne: userId }, // Use UUID string
      readBy: { $ne: userId }, // Use UUID string
      isDeleted: false,
    });
  }

  async searchMessages(conversationId: string, searchTerm: string, limit: number = 20): Promise<IMessage[]> {
    return await this.getCollection()
      .find({
        conversationId: new ObjectId(conversationId), // ✅ Convert to ObjectId
        content: { $regex: searchTerm, $options: 'i' },
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
}

export default new MessageModel();
