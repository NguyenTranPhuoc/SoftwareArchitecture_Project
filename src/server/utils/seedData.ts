// Seed test data for development
import { ObjectId } from 'mongodb';
import { getMongoDB } from './database';

export async function seedTestData() {
  console.log('\n🌱 Seeding test data...\n');

  // Use fixed ObjectIds for consistent testing
  const userIds = {
    me: new ObjectId('674612345678901234567890'),
    user1: new ObjectId('674612345678901234567891'),
    user2: new ObjectId('674612345678901234567892'),
  };

  try {

    // Create test conversations in MongoDB
    const db = getMongoDB();
    const conversationsCollection = db.collection('conversations');
    const messagesCollection = db.collection('messages');

    // Clear existing test data
    await conversationsCollection.deleteMany({});
    await messagesCollection.deleteMany({});

    // Create a group conversation with fixed ID
    const groupConvId = new ObjectId('674612345678901234abcde1');
    await conversationsCollection.insertOne({
      _id: groupConvId,
      participants: [userIds.me, userIds.user1, userIds.user2],
      type: 'group',
      name: 'UAV Pilots Club',
      createdBy: userIds.me,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create a direct conversation with fixed ID
    const directConvId = new ObjectId('674612345678901234abcde2');
    await conversationsCollection.insertOne({
      _id: directConvId,
      participants: [userIds.me, userIds.user1],
      type: 'direct',
      createdBy: userIds.me,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✓ Created test conversations in MongoDB');

    // Create some test messages
    const message1Id = new ObjectId();
    await messagesCollection.insertOne({
      _id: message1Id,
      conversationId: groupConvId,
      senderId: userIds.user1,
      content: '@Minh Anh Lê Đỗ e xin tuần sau...',
      type: 'text',
      readBy: [userIds.user1],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date('2025-11-15T11:31:00'),
      updatedAt: new Date('2025-11-15T11:31:00'),
    });

    const message2Id = new ObjectId();
    await messagesCollection.insertOne({
      _id: message2Id,
      conversationId: groupConvId,
      senderId: userIds.me,
      content: 'Ok nè 😊',
      type: 'text',
      readBy: [userIds.me],
      isEdited: false,
      isDeleted: false,
      createdAt: new Date('2025-11-15T11:35:00'),
      updatedAt: new Date('2025-11-15T11:35:00'),
    });

    // Update last message references
    await conversationsCollection.updateOne(
      { _id: groupConvId },
      {
        $set: {
          lastMessageId: message2Id,
          lastMessageTimestamp: new Date('2025-11-15T11:35:00'),
        },
      }
    );

    console.log('✓ Created test messages in MongoDB');

    console.log('\n✅ Test data seeded successfully!\n');
    console.log('Test User IDs:');
    console.log(`  - Me (Như Nguyễn): ${userIds.me.toString()}`);
    console.log(`  - User 1 (Thành Trung): ${userIds.user1.toString()}`);
    console.log(`  - User 2 (Hoàng Đặng Trung Kiên): ${userIds.user2.toString()}`);
    console.log('\nTest Conversation IDs:');
    console.log(`  - Group (UAV Pilots Club): ${groupConvId.toString()}`);
    console.log(`  - Direct (Thành Trung): ${directConvId.toString()}`);
    console.log('');

    return {
      userIds,
      conversationIds: {
        group: groupConvId,
        direct: directConvId,
      },
    };
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}
