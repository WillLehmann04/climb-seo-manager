import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB
 */
export async function connectDB() {
    if (isConnected) {
        console.log('📊 Using existing MongoDB connection');
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI;
        
        if (!mongoUri) {
            console.log('⚠️  MONGODB_URI not set - MongoDB features disabled');
            return;
        }

        await mongoose.connect(mongoUri, {
            dbName: process.env.MONGODB_DB_NAME || 'test',
        });

        isConnected = true;
        console.log('✅ Connected to MongoDB');

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
            isConnected = false;
        });

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB() {
    if (!isConnected) return;

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error);
    }
}

export { mongoose };


