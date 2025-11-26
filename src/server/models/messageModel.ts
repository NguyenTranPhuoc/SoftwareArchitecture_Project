import { Collection, ObjectId } from 'mongodb';
import { getMongoDB } from '../utils/database';

export interface IMessage {
  _id?: ObjectId;
  conversationId: ObjectId; // ✅ Changed from string to ObjectId
  senderId: ObjectId; // ✅ Changed from string to ObjectId
  content: string;
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'sticker' | 'location'; // ✅ Added sticker, location
  fileUrl?: string; // For media messages (GCS bucket URL)
  fileName?: string; // For file messages
  fileSize?: number; // For file messages
  thumbnailUrl?: string; // ✅ NEW: Thumbnail for video/image
  replyTo?: ObjectId; // ✅ Changed from string to ObjectId - Message ID being replied to
  readBy: ObjectId[]; // ✅ Changed from string[] to ObjectId[] - Array of user IDs who have read the message
  reactions?: {
    emoji: string;
    userId: ObjectId; // ✅ Changed from string to ObjectId
  }[];
  isEdited: boolean;
  editedAt?: Date; // ✅ NEW: Timestamp of last edit
  isDeleted: boolean;
  deletedAt?: Date; // ✅ NEW: Timestamp of deletion
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
    return await this.collection
      .find({
        conversationId: new ObjectId(conversationId), // ✅ Convert to ObjectId
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
        $addToSet: { readBy: new ObjectId(userId) }, // ✅ Convert userId to ObjectId
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async markConversationMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const userObjId = new ObjectId(userId); // ✅ Convert once for reuse
    const result = await this.collection.updateMany(
      {
        conversationId: new ObjectId(conversationId), // ✅ Convert to ObjectId
        senderId: { $ne: userObjId }, // Don't mark own messages
        readBy: { $ne: userObjId }, // Only messages not already read
      },
      {
        $addToSet: { readBy: userObjId },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount;
  }

  async updateMessage(messageId: string, content: string): Promise<boolean> {
    const now = new Date();
    const result = await this.collection.updateOne(
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
      const result = await this.collection.updateOne(
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
      const result = await this.collection.deleteOne({ _id: new ObjectId(messageId) });
      return result.deletedCount > 0;
    }
  }

  async addReaction(messageId: string, emoji: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(messageId) },
      {
        $push: {
          reactions: { emoji, userId: new ObjectId(userId) }, // ✅ Convert userId to ObjectId
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
          reactions: { emoji, userId: new ObjectId(userId) }, // ✅ Convert userId to ObjectId
        },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const userObjId = new ObjectId(userId); // ✅ Convert once for reuse
    return await this.collection.countDocuments({
      conversationId: new ObjectId(conversationId), // ✅ Convert to ObjectId
      senderId: { $ne: userObjId },
      readBy: { $ne: userObjId },
      isDeleted: false,
    });
  }

  async searchMessages(conversationId: string, searchTerm: string, limit: number = 20): Promise<IMessage[]> {
    return await this.collection
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
