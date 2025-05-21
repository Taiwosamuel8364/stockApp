const mongoose = require('mongoose');

const PortfolioItemSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    averagePrice: {
        type: Number,
        required: true,
        min: 0
    }
});

const TradeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['BUY', 'SELL'],
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    total: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const DemoAccountSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 100000,  // Starting balance of $100,000
        min: 0
    },
    portfolio: {
        type: Map,
        of: PortfolioItemSchema,
        default: {}
    },
    tradeHistory: {
        type: [TradeSchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated timestamp before saving
DemoAccountSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Add methods to calculate portfolio value
DemoAccountSchema.methods.calculatePortfolioValue = async function() {
    let totalValue = 0;
    const axios = require('axios');
    
    for (const [symbol, data] of this.portfolio.entries()) {
        try {
            const response = await axios.get('https://www.alphavantage.co/query', {
                params: {
                    function: 'GLOBAL_QUOTE',
                    symbol,
                    apikey: process.env.ALPHA_VANTAGE_API_KEY
                }
            });
            
            const stockData = response.data['Global Quote'];
            if (stockData) {
                const currentPrice = parseFloat(stockData['05. price']);
                totalValue += currentPrice * data.quantity;
            }
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
        }
    }
    
    return totalValue;
};

// Add method to calculate profit/loss
DemoAccountSchema.methods.calculateProfitLoss = async function() {
    const currentValue = await this.calculatePortfolioValue();
    const investedValue = Array.from(this.portfolio.values())
        .reduce((sum, item) => sum + (item.quantity * item.averagePrice), 0);
    
    return {
        profitLoss: currentValue - investedValue,
        profitLossPercentage: ((currentValue - investedValue) / investedValue) * 100
    };
};

const DemoAccount = mongoose.model('DemoAccount', DemoAccountSchema);

module.exports = DemoAccount;
