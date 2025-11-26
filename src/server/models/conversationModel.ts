import { Collection, ObjectId } from 'mongodb';
import { getMongoDB } from '../utils/database';

export interface IConversation {
  _id?: ObjectId;
  participants: ObjectId[]; // ✅ Changed from string[] to ObjectId[] - Array of user IDs
  type: 'direct' | 'group';
  name?: string; // For group chats
  avatar?: string; // For group chats (GCS bucket URL)
  createdBy?: ObjectId; // ✅ Changed from string to ObjectId - User ID who created the conversation
  lastMessageId?: ObjectId; // ✅ NEW: Reference to last message instead of embedding full object
  lastMessageTimestamp?: Date; // ✅ NEW: Denormalized for sorting without $lookup
  isArchived?: boolean; // ✅ NEW: Whether conversation is archived
  archivedBy?: ObjectId[]; // ✅ NEW: Array of user IDs who archived this conversation
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
      .find({ participants: new ObjectId(userId) }) // ✅ Convert userId to ObjectId
      .sort({ lastMessageTimestamp: -1 }) // ✅ Sort by lastMessageTimestamp instead of updatedAt for better UX
      .toArray();
  }

  async findDirectConversation(userId1: string, userId2: string): Promise<IConversation | null> {
    return await this.collection.findOne({
      type: 'direct',
      participants: { $all: [new ObjectId(userId1), new ObjectId(userId2)] }, // ✅ Convert both userIds to ObjectId
    });
  }

  // ✅ REFACTORED: Use lastMessageId instead of embedding full message object
  async updateLastMessage(
    conversationId: string,
    messageId: string,
    timestamp: Date
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: {
          lastMessageId: new ObjectId(messageId), // ✅ Store message reference
          lastMessageTimestamp: timestamp, // ✅ Denormalized timestamp for sorting
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
        $addToSet: { participants: new ObjectId(userId) }, // ✅ Convert userId to ObjectId
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async removeParticipant(conversationId: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $pull: { participants: new ObjectId(userId) }, // ✅ Convert userId to ObjectId
        $set: { updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  // ✅ NEW: Archive/unarchive conversation for a user
  async archiveConversation(conversationId: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $addToSet: { archivedBy: new ObjectId(userId) },
        $set: { isArchived: true, updatedAt: new Date() },
      }
    );

    return result.modifiedCount > 0;
  }

  async unarchiveConversation(conversationId: string, userId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $pull: { archivedBy: new ObjectId(userId) },
        $set: { updatedAt: new Date() },
      }
    );

    // If no users have archived, set isArchived to false
    const conversation = await this.findConversationById(conversationId);
    if (conversation && (!conversation.archivedBy || conversation.archivedBy.length === 0)) {
      await this.collection.updateOne(
        { _id: new ObjectId(conversationId) },
        { $set: { isArchived: false } }
      );
    }

    return result.modifiedCount > 0;
  }

  // ✅ NEW: Get last message details with $lookup
  async getConversationWithLastMessage(conversationId: string) {
    const result = await this.collection
      .aggregate([
        { $match: { _id: new ObjectId(conversationId) } },
        {
          $lookup: {
            from: 'messages',
            localField: 'lastMessageId',
            foreignField: '_id',
            as: 'lastMessageDetails',
          },
        },
        { $unwind: { path: '$lastMessageDetails', preserveNullAndEmptyArrays: true } },
      ])
      .toArray();

    return result[0] || null;
  }

  // ✅ NEW: Get all conversations with last message details
  async getUserConversationsWithLastMessage(userId: string) {
    return await this.collection
      .aggregate([
        { $match: { participants: new ObjectId(userId) } },
        {
          $lookup: {
            from: 'messages',
            localField: 'lastMessageId',
            foreignField: '_id',
            as: 'lastMessageDetails',
          },
        },
        { $unwind: { path: '$lastMessageDetails', preserveNullAndEmptyArrays: true } },
        { $sort: { lastMessageTimestamp: -1 } },
      ])
      .toArray();
  }
}

export default new ConversationModel();
