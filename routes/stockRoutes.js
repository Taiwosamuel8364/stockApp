const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import stock controller (we'll create this next)
const stockController = require('../controllers/stockController');

// @route   GET /api/stocks/:symbol
// @desc    Get stock price by symbol
router.get('/:symbol', [
    check('symbol').notEmpty().withMessage('Stock symbol is required')
], stockController.getStockPrice);

// @route   GET /api/stocks/:symbol/history
// @desc    Get stock price history
router.get('/:symbol/history', [
    check('symbol').notEmpty().withMessage('Stock symbol is required')
], stockController.getStockHistory);

// @route   GET /api/stocks/search/:query
// @desc    Search for stocks
router.get('/search/:query', [
    check('query').notEmpty().withMessage('Search query is required')
], stockController.searchStocks);

// @route   GET /api/stocks/:symbol/profile
// @desc    Get detailed company profile
router.get('/:symbol/profile', [
    check('symbol').notEmpty().withMessage('Stock symbol is required')
], stockController.getCompanyProfile);

module.exports = router;