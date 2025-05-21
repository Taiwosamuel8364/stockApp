const mongoose = require('mongoose');
require('dotenv').config();
const DemoAccount = require('../models/DemoAccount');

const demoAccounts = [
    {
        userId: 'demo-user-1',
        balance: 100000,
        portfolio: {
            'AAPL': {
                symbol: 'AAPL',
                quantity: 10,
                averagePrice: 175.50
            },
            'GOOGL': {
                symbol: 'GOOGL',
                quantity: 5,
                averagePrice: 2750.25
            }
        },
        tradeHistory: [
            {
                type: 'BUY',
                symbol: 'AAPL',
                quantity: 10,
                price: 175.50,
                total: 1755.00,
                timestamp: new Date('2025-05-19T10:00:00Z')
            },
            {
                type: 'BUY',
                symbol: 'GOOGL',
                quantity: 5,
                price: 2750.25,
                total: 13751.25,
                timestamp: new Date('2025-05-19T11:00:00Z')
            }
        ]
    },
    {
        userId: 'demo-user-2',
        balance: 50000,
        portfolio: {
            'MSFT': {
                symbol: 'MSFT',
                quantity: 15,
                averagePrice: 325.75
            },
            'TSLA': {
                symbol: 'TSLA',
                quantity: 8,
                averagePrice: 750.25
            }
        },
        tradeHistory: [
            {
                type: 'BUY',
                symbol: 'MSFT',
                quantity: 15,
                price: 325.75,
                total: 4886.25,
                timestamp: new Date('2025-05-19T09:30:00Z')
            },
            {
                type: 'BUY',
                symbol: 'TSLA',
                quantity: 8,
                price: 750.25,
                total: 6002.00,
                timestamp: new Date('2025-05-19T10:30:00Z')
            }
        ]
    }
];

const seedDemoAccounts = async () => {
    try {        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 50,
            retryWrites: true,
            w: 'majority'
        });
        console.log('Connected to MongoDB...');

        // Clear existing demo accounts
        await DemoAccount.deleteMany({});
        console.log('Cleared existing demo accounts...');

        // Insert new demo accounts
        await DemoAccount.insertMany(demoAccounts);
        console.log('Demo accounts seeded successfully!');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding demo accounts:', error);
        process.exit(1);
    }
};

seedDemoAccounts();
