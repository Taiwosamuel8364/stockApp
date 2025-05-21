const mongoose = require('mongoose');

const connectWithRetry = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`MongoDB connection attempt ${i + 1} of ${retries}`);
            
            // Remove any surrounding quotes from the URI
            const uri = process.env.MONGODB_URI.replace(/^['"]|['"]$/g, '');
            
            const conn = await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000, // Increase timeout to 10s
                socketTimeoutMS: 45000,
                family: 4,
                maxPoolSize: 50,
                retryWrites: true,
                w: 'majority'
            });
            console.log(`MongoDB connected successfully on attempt ${i + 1}`);
            return conn;
        } catch (err) {
            if (i === retries - 1) throw err; // Last attempt failed
            console.log(`Connection attempt failed, retrying in 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }
    }
};

const connectDB = async () => {
    try {
        const conn = await connectWithRetry();

        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error closing MongoDB connection:', err);
                process.exit(1);
            }
        });

        return conn;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error; // Let the server.js handle the error
    }
};

module.exports = connectDB;
