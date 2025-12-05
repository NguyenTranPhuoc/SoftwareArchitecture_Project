// Run seed data script
import { connectMongoDB } from './database';
import { seedTestData } from './seedData';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();
    console.log('Connected!');
    
    await seedTestData();
    
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

run();
