const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const tradingController = require('../controllers/tradingController');
const { protect } = require('../middleware/auth');

// @route   POST /api/trading/buy
// @desc    Buy stocks
router.post('/buy', protect, [
    check('symbol').notEmpty().withMessage('Stock symbol is required'),
    check('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], tradingController.buyStock);

// @route   POST /api/trading/sell
// @desc    Sell stocks
router.post('/sell', protect, [
    check('symbol').notEmpty().withMessage('Stock symbol is required'),
    check('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], tradingController.sellStock);

// @route   GET /api/trading/portfolio
// @desc    Get user's portfolio
router.get('/portfolio', protect,tradingController.getPortfolio);

// @route   GET /api/trading/history
// @desc    Get trading history
router.get('/history', protect,tradingController.getTradeHistory);

// @route   GET /api/trading/balance
// @desc    Get account balance
router.get('/balance', protect,tradingController.getBalance);

module.exports = router;
