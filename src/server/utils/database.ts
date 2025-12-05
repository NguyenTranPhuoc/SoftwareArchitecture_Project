import { MongoClient, Db } from 'mongodb';
import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB client
let mongoClient: MongoClient;
let mongoDB: Db;

export const connectMongoDB = async (): Promise<Db> => {
  if (mongoDB) {
    return mongoDB;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/zalo_clone';
    mongoClient = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    await mongoClient.connect();
    mongoDB = mongoClient.db(); // Use database from URI
    console.log('✓ MongoDB connected successfully');
    return mongoDB;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    throw error;
  }
};

export const getMongoDB = (): Db => {
  if (!mongoDB) {
    throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  }
  return mongoDB;
};

// Redis client
let redisClient: RedisClientType;

export const connectRedis = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  try {
    // Use REDIS_URL if available, otherwise construct from individual vars
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      redisClient = createClient({ url: redisUrl });
    } else {
      redisClient = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD || undefined,
      });
    }

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('✓ Redis connected successfully'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('✗ Redis connection error:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redisClient;
};

// Test database connections
export const testDatabaseConnections = async (): Promise<void> => {
  console.log('Testing database connections...');

  try {
    // Test MongoDB (required)
    const mongodb = await connectMongoDB();
    await mongodb.command({ ping: 1 });
    console.log('✓ MongoDB connected successfully');

    // Test Redis (required for real-time features)
    const redis = await connectRedis();
    await redis.ping();
    console.log('✓ Redis connected successfully');

    console.log('\n✓ All database connections successful - server ready!\n');
  } catch (error) {
    console.error('\n✗ Database connection test failed:', error);
    console.error('Make sure MongoDB and Redis are running.\n');
    throw error;
  }
};

// Graceful shutdown
export const closeDatabaseConnections = async (): Promise<void> => {
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log('✓ MongoDB connection closed');
    }

    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.log('✓ Redis connection closed');
    }
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
};
