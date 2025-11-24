import { Collection, ObjectId } from 'mongodb';
import { getMongoDB } from '../utils/database';

export interface IConversation {
  _id?: ObjectId;
  participants: string[]; // Array of user IDs
  type: 'direct' | 'group';
  name?: string; // For group chats
  avatar?: string; // For group chats
  createdBy?: string; // User ID who created the conversation
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
    type: 'text' | 'image' | 'file' | 'audio' | 'video';
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationModel {
  private collection: Collection<IConversation>;

  constructor() {
    const db = getMongoDB();
    this.collection = db.collection<IConversation>('conversations');
  }

  async createConversation(data: Omit<IConversation, '_id' | 'createdAt' | 'updatedAt'>): Promise<IConversation> {
    const conversation: IConversation = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(conversation);
    return {
      ...conversation,
      _id: result.insertedId,
    };
  }

  async findConversationById(conversationId: string): Promise<IConversation | null> {
    return await this.collection.findOne({ _id: new ObjectId(conversationId) });
  }

  async findConversationsByUserId(userId: string): Promise<IConversation[]> {
    return await this.collection
      .find({ participants: userId })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  async findDirectConversation(userId1: string, userId2: string): Promise<IConversation | null> {
    return await this.collection.findOne({
      type: 'direct',
      participants: { $all: [userId1, userId2] },
    });
  }

  async updateLastMessage(
    conversationId: string,
    lastMessage: IConversation['lastMessage']
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessage,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  async updateConversation(
    conversationId: string,
    updates: Partial<IConversation>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(conversationId) });
    return result.deletedCount > 0;
  }

  async addParticipant(conversationId: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $addToSet: { participants: userId },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async removeParticipant(conversationId: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $pull: { participants: userId },
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }
}

export default new ConversationModel();
