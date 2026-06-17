const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        try {
            // Attempt short-timeout connection
            const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
            console.log(`MongoDB Connected (Atlas/Local): ${conn.connection.host}`);
        } catch (initialError) {
            console.log("Standard MongoDB connection failed. Starting in-memory MongoDB fallback...");
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
