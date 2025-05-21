const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const stockController = require('../controllers/stockController');

// @route   GET /api/stocks/market-news
// @desc    Get general market news
router.get('/news', stockController.getMarketNews);

// @route   GET /api/stocks/:symbol/news
// @desc    Get news for specific stock
router.get('/:symbol/news', [
    check('symbol').notEmpty().withMessage('Stock symbol is required')
], stockController.getStockNews);

module.exports = router;