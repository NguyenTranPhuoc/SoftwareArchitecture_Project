import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';
import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// PostgreSQL connection pool
export const pgPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : '',
  database: process.env.DB_NAME || 'zalo_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// MongoDB client
let mongoClient: MongoClient;
let mongoDB: Db;

export const connectMongoDB = async (): Promise<Db> => {
  if (mongoDB) {
    return mongoDB;
  }

  try {
    mongoClient = new MongoClient(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 3000, // Timeout after 3 seconds
    });
    await mongoClient.connect();
    mongoDB = mongoClient.db(process.env.MONGODB_DB_NAME || 'zalo_chat');
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
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

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
  try {
    // Test PostgreSQL
    const pgResult = await pgPool.query('SELECT NOW()');
    console.log('✓ PostgreSQL connection test passed:', pgResult.rows[0].now);

    // Test MongoDB (optional for initial development)
    try {
      const mongodb = await connectMongoDB();
      await mongodb.command({ ping: 1 });
      console.log('✓ MongoDB connection test passed');
    } catch (mongoError) {
      console.warn('⚠ MongoDB connection failed - chat features will not work:', (mongoError as Error).message);
      console.warn('⚠ Please install MongoDB to enable chat functionality');
    }

    // Test Redis (optional - skip if not configured)
    try {
      if (process.env.REDIS_HOST && process.env.REDIS_HOST !== '') {
        const redis = await connectRedis();
        await redis.ping();
        console.log('✓ Redis connection test passed');
      } else {
        console.log('⚠ Redis not configured - skipping (optional)');
      }
    } catch (redisError) {
      console.warn('⚠ Redis connection failed - continuing without Redis:', (redisError as Error).message);
    }

    console.log('\n✓ PostgreSQL is connected - server can start!\n');
  } catch (error) {
    console.error('\n✗ Database connection test failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeDatabaseConnections = async (): Promise<void> => {
  try {
    await pgPool.end();
    console.log('✓ PostgreSQL pool closed');

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
