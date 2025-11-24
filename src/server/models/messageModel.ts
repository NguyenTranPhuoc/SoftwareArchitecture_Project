import { Collection, ObjectId } from 'mongodb';
import { getMongoDB } from '../utils/database';

export interface IMessage {
  _id?: ObjectId;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  fileUrl?: string; // For media messages
  fileName?: string; // For file messages
  fileSize?: number; // For file messages
  replyTo?: string; // Message ID being replied to
  readBy: string[]; // Array of user IDs who have read the message
  reactions?: {
    emoji: string;
    userId: string;
  }[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MessageModel {
  private collection: Collection<IMessage>;

  constructor() {
    const db = getMongoDB();
    this.collection = db.collection<IMessage>('messages');
  }

  async createMessage(data: Omit<IMessage, '_id' | 'readBy' | 'isEdited' | 'isDeleted' | 'createdAt' | 'updatedAt'>): Promise<IMessage> {
    const message: IMessage = {
      ...data,
      readBy: [data.senderId], // Sender has read their own message
      isEdited: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(message);
    return {
      ...message,
      _id: result.insertedId,
    };
  }

  async findMessageById(messageId: string): Promise<IMessage | null> {
    return await this.collection.findOne({ _id: new ObjectId(messageId) });
  }

  async findMessagesByConversationId(
    conversationId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<IMessage[]> {
    return await this.collection
      .find({ conversationId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async findMessagesAfterTimestamp(
    conversationId: string,
    timestamp: Date
  ): Promise<IMessage[]> {
    return await this.collection
      .find({
        conversationId,
        createdAt: { $gt: timestamp },
        isDeleted: false,
      })
      .sort({ createdAt: 1 })
      .toArray();
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $addToSet: { readBy: userId },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async markConversationMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const result = await this.collection.updateMany(
      {
        conversationId,
        senderId: { $ne: userId }, // Don't mark own messages
        readBy: { $ne: userId }, // Only messages not already read
      },
      {
        $addToSet: { readBy: userId },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount;
  }

  async updateMessage(messageId: string, content: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $set: {
          content,
          isEdited: true,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  async deleteMessage(messageId: string, softDelete: boolean = true): Promise<boolean> {
    if (softDelete) {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(messageId) },
        {
          $set: {
            isDeleted: true,
            content: 'This message has been deleted',
            updatedAt: new Date(),
          },
        }
      );
      return result.modifiedCount > 0;
    } else {
      const result = await this.collection.deleteOne({ _id: new ObjectId(messageId) });
      return result.deletedCount > 0;
    }
  }

  async addReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $push: {
          reactions: { emoji, userId },
        },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async removeReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $pull: {
          reactions: { emoji, userId },
        },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    return await this.collection.countDocuments({
      conversationId,
      senderId: { $ne: userId },
      readBy: { $ne: userId },
      isDeleted: false,
    });
  }

  async searchMessages(conversationId: string, searchTerm: string, limit: number = 20): Promise<IMessage[]> {
    return await this.collection
      .find({
        conversationId,
        content: { $regex: searchTerm, $options: 'i' },
        isDeleted: false,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }
}

export default new MessageModel();
