const axios = require('axios');
const { validationResult } = require('express-validator');
const DemoAccount = require('../models/DemoAccount');

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Helper function to get or create demo account
const getOrCreateDemoAccount = async (username) => {
    let account = await DemoAccount.findOne({ userId: username });
    if (!account) {
        account = new DemoAccount({ userId: username });
        await account.save();
    }
    return account;
};

// @desc    Buy stocks
exports.buyStock = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { symbol, quantity } = req.body;
        
        // Get current stock price
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol,
                apikey: API_KEY
            }
        });

        const stockData = response.data['Global Quote'];
        if (!stockData || Object.keys(stockData).length === 0) {
            return res.status(404).json({ message: 'Stock not found' });
        }

        const currentPrice = parseFloat(stockData['05. price']);
        const totalCost = currentPrice * quantity;

        // Get or create demo account using authenticated user's username
        const demoAccount = await getOrCreateDemoAccount(req.user.username);

        // Check if user has enough balance
        if (totalCost > demoAccount.balance) {
            return res.status(400).json({ 
                message: 'Insufficient funds',
                required: totalCost,
                available: demoAccount.balance
            });
        }        // Update portfolio
        let stockPosition = demoAccount.portfolio.get(symbol) || {
            symbol: symbol,
            quantity: 0,
            averagePrice: 0
        };

        const oldTotal = stockPosition.quantity * stockPosition.averagePrice;
        const newTotal = oldTotal + (currentPrice * quantity);
        const newQuantity = stockPosition.quantity + quantity;
        
        stockPosition = {
            symbol: symbol,
            quantity: newQuantity,
            averagePrice: newTotal / newQuantity
        };
        
        demoAccount.portfolio.set(symbol, stockPosition);
        demoAccount.balance -= totalCost;

        // Record trade
        const trade = {
            type: 'BUY',
            symbol,
            quantity,
            price: currentPrice,
            total: totalCost,
            timestamp: new Date()
        };
        demoAccount.tradeHistory.push(trade);

        // Save changes to database
        await demoAccount.save();        const updatedPosition = demoAccount.portfolio.get(symbol);
        res.json({
            message: 'Stock purchased successfully',
            trade,
            portfolio: updatedPosition,
            balance: demoAccount.balance
        });

    } catch (error) {
        console.error('Error buying stock:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Sell stocks
exports.sellStock = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }    try {
        const { symbol, quantity } = req.body;
        const demoAccount = await getOrCreateDemoAccount(req.user.username);

        // Check if user owns enough shares
        const stockPosition = demoAccount.portfolio.get(symbol);
        if (!stockPosition || stockPosition.quantity < quantity) {
            return res.status(400).json({ 
                message: 'Insufficient shares',
                required: quantity,
                available: stockPosition?.quantity || 0
            });
        }

        // Get current stock price
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol,
                apikey: API_KEY
            }
        });

        const stockData = response.data['Global Quote'];
        if (!stockData || Object.keys(stockData).length === 0) {
            return res.status(404).json({ message: 'Stock not found' });
        }

        const currentPrice = parseFloat(stockData['05. price']);
        const totalValue = currentPrice * quantity;        // Update portfolio
        stockPosition.quantity -= quantity;
        demoAccount.balance += totalValue;

        // Remove stock from portfolio if quantity is 0
        if (stockPosition.quantity === 0) {
            demoAccount.portfolio.delete(symbol);
        } else {
            stockPosition = {
                symbol: symbol,
                quantity: stockPosition.quantity,
                averagePrice: stockPosition.averagePrice
            };
            demoAccount.portfolio.set(symbol, stockPosition);
        }

        // Record trade
        const trade = {
            type: 'SELL',
            symbol,
            quantity,
            price: currentPrice,
            total: totalValue,
            timestamp: new Date()
        };
        demoAccount.tradeHistory.push(trade);
        
        // Save changes to database
        await demoAccount.save();        const updatedPosition = demoAccount.portfolio.get(symbol) || { 
            symbol: symbol,
            quantity: 0, 
            averagePrice: 0 
        };
        
        res.json({
            message: 'Stock sold successfully',
            trade,
            portfolio: updatedPosition,
            balance: demoAccount.balance
        });

    } catch (error) {
        console.error('Error selling stock:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get portfolio
exports.getPortfolio = async (req, res) => {
    try {
        const demoAccount = await getOrCreateDemoAccount(req.user.username);
        
        // Get current prices for all stocks in portfolio
        const portfolioEntries = Array.from(demoAccount.portfolio.entries());
        const portfolioWithCurrentPrices = await Promise.all(
            portfolioEntries.map(async ([symbol, data]) => {
                const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
                    params: {
                        function: 'GLOBAL_QUOTE',
                        symbol,
                        apikey: API_KEY
                    }
                });

                const stockData = response.data['Global Quote'];
                const currentPrice = parseFloat(stockData['05. price']);
                const profitLoss = (currentPrice - data.averagePrice) * data.quantity;

                return {
                    symbol,
                    quantity: data.quantity,
                    averagePrice: data.averagePrice,
                    currentPrice,
                    totalValue: currentPrice * data.quantity,
                    profitLoss,
                    profitLossPercentage: (profitLoss / (data.averagePrice * data.quantity)) * 100
                };
            })
        );

        res.json({
            portfolio: portfolioWithCurrentPrices,
            totalValue: portfolioWithCurrentPrices.reduce((sum, stock) => sum + stock.totalValue, 0),
            balance: demoAccount.balance
        });

    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get trade history
exports.getTradeHistory = async (req, res) => {
    try {
        const demoAccount = await getOrCreateDemoAccount(req.user.username);
        res.json(demoAccount.tradeHistory);
    } catch (error) {
        console.error('Error fetching trade history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get account balance
exports.getBalance = async (req, res) => {
    try {
        const demoAccount = await getOrCreateDemoAccount(req.user.username);
        res.json({ balance: demoAccount.balance });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
