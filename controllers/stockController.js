const axios = require('axios');
const { validationResult } = require('express-validator');

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// @desc    Get current stock price
exports.getStockPrice = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { symbol } = req.params;
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

        const formattedData = {
            symbol: stockData['01. symbol'],
            price: stockData['05. price'],
            change: stockData['09. change'],
            changePercent: stockData['10. change percent'],
            volume: stockData['06. volume'],
            lastTradeDate: stockData['07. latest trading day']
        };

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching stock price:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get stock price history
exports.getStockHistory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { symbol } = req.params;
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol,
                apikey: API_KEY
            }
        });

        const timeSeriesData = response.data['Time Series (Daily)'];
        if (!timeSeriesData) {
            return res.status(404).json({ message: 'Historical data not found' });
        }

        const historicalData = Object.entries(timeSeriesData).map(([date, data]) => ({
            date,
            open: data['1. open'],
            high: data['2. high'],
            low: data['3. low'],
            close: data['4. close'],
            volume: data['5. volume']
        }));

        res.json(historicalData);
    } catch (error) {
        console.error('Error fetching stock history:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Search for stocks
exports.searchStocks = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { query } = req.params;
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'SYMBOL_SEARCH',
                keywords: query,
                apikey: API_KEY
            }
        });

        const matches = response.data.bestMatches || [];
        const searchResults = matches.map(match => ({
            symbol: match['1. symbol'],
            name: match['2. name'],
            type: match['3. type'],
            region: match['4. region'],
            marketOpen: match['5. marketOpen'],
            marketClose: match['6. marketClose'],
            timezone: match['7. timezone'],
            currency: match['8. currency']
        }));

        res.json(searchResults);
    } catch (error) {
        console.error('Error searching stocks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get company profile and fundamental data
exports.getMarketNews = async (req, res) => {
    try {
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'NEWS_SENTIMENT',
                apikey: API_KEY,
                sort: 'LATEST',
                limit: 50
            }
        });

        if (!response.data || !response.data.feed) {
            return res.status(404).json({ message: 'News not found' });
        }

        const news = response.data.feed.map(article => ({
            title: article.title,
            url: article.url,
            timePublished: article.time_published,
            authors: article.authors,
            summary: article.summary,
            source: article.source,
            overallSentiment: article.overall_sentiment_label,
            sentimentScore: article.overall_sentiment_score,
            topics: article.topics,
            tickerSentiment: article.ticker_sentiment
        }));

        res.json(news);
    } catch (error) {
        console.error('Error fetching market news:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStockNews = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { symbol } = req.params;
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'NEWS_SENTIMENT',
                apikey: API_KEY,
                tickers: symbol,
            }
        });

        if (!response.data || !response.data.feed) {
            return res.status(404).json({ message: 'News not found for this stock' });
        }

        const news = response.data.feed.map(article => ({
            title: article.title,
            url: article.url,
            timePublished: article.time_published,
            authors: article.authors,
            summary: article.summary,
            source: article.source,
            overallSentiment: article.overall_sentiment_label,
            sentimentScore: article.overall_sentiment_score,
            relevanceScore: article.relevance_score,
            tickerSentiment: article.ticker_sentiment.find(t => t.ticker === symbol)
        }));

        res.json(news);
    } catch (error) {
        console.error('Error fetching stock news:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCompanyProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { symbol } = req.params;
        
        // Get company overview
        const overviewResponse = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'OVERVIEW',
                symbol,
                apikey: API_KEY
            }
        });

        if (!overviewResponse.data || Object.keys(overviewResponse.data).length === 0) {
            return res.status(404).json({ message: 'Company profile not found' });
        }

        const profile = {
            symbol: overviewResponse.data.Symbol,
            name: overviewResponse.data.Name,
            description: overviewResponse.data.Description,
            exchange: overviewResponse.data.Exchange,
            currency: overviewResponse.data.Currency,
            country: overviewResponse.data.Country,
            sector: overviewResponse.data.Sector,
            industry: overviewResponse.data.Industry,
            fundamentals: {
                marketCap: overviewResponse.data.MarketCapitalization,
                peRatio: overviewResponse.data.PERatio,
                dividend: {
                    yield: overviewResponse.data.DividendYield,
                    perShare: overviewResponse.data.DividendPerShare,
                },
                eps: overviewResponse.data.EPS,
                beta: overviewResponse.data.Beta,
                yearHigh: overviewResponse.data['52WeekHigh'],
                yearLow: overviewResponse.data['52WeekLow'],
            },
            financials: {
                profitMargin: overviewResponse.data.ProfitMargin,
                operatingMargin: overviewResponse.data.OperatingMarginTTM,
                returnOnAssets: overviewResponse.data.ReturnOnAssetsTTM,
                returnOnEquity: overviewResponse.data.ReturnOnEquityTTM,
                revenuePerShare: overviewResponse.data.RevenuePerShareTTM,
            }
        };

        res.json(profile);
    } catch (error) {
        console.error('Error fetching company profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
