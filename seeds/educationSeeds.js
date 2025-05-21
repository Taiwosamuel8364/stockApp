const mongoose = require('mongoose');
require('dotenv').config();
const { Lesson, Quiz, Badge } = require('../models/Education');

const lessons = [
    {
        title: 'Introduction to Stock Trading',
        description: 'Learn the basics of stock trading and market fundamentals',
        content: `
# Introduction to Stock Trading

Stock trading is the buying and selling of company shares on a stock exchange. This lesson will cover:

## What are Stocks?
Stocks represent ownership in a company. When you buy a share of stock, you're buying a small piece of that company.

## Stock Exchanges
Stock exchanges are markets where stocks are traded. The major U.S. exchanges are:
- New York Stock Exchange (NYSE)
- NASDAQ

## Basic Trading Terms
- **Bid**: The highest price a buyer will pay
- **Ask**: The lowest price a seller will accept
- **Spread**: The difference between bid and ask prices
- **Volume**: Number of shares traded
- **Market Order**: Buy/sell at current market price
- **Limit Order**: Buy/sell at specified price or better

## Getting Started
1. Understand your investment goals
2. Learn to read stock quotes
3. Start with a demo account to practice
4. Develop a trading strategy
5. Always manage your risk

Remember: Never invest more than you can afford to lose.`,
        order: 1,
        category: 'basics',
        difficulty: 'beginner',
        estimatedDuration: 30
    },
    {
        title: 'Technical Analysis Fundamentals',
        description: 'Learn how to analyze stock price patterns and indicators',
        content: `
# Technical Analysis Fundamentals

Technical analysis is the study of price movements using charts and indicators.

## Price Charts
- Line charts
- Candlestick charts
- Bar charts

## Common Patterns
- Support and resistance levels
- Trend lines
- Chart patterns (Head & Shoulders, Double Top/Bottom)

## Key Technical Indicators
1. Moving Averages
   - Simple Moving Average (SMA)
   - Exponential Moving Average (EMA)

2. Momentum Indicators
   - Relative Strength Index (RSI)
   - MACD (Moving Average Convergence Divergence)

3. Volume Indicators
   - Volume Profile
   - On-Balance Volume (OBV)

## Using Technical Analysis
- Identify trends
- Find entry and exit points
- Confirm signals with multiple indicators
- Always use stop-loss orders

Remember: Technical analysis is just one tool. Combine it with fundamental analysis for better results.`,
        order: 2,
        category: 'technical-analysis',
        difficulty: 'intermediate',
        estimatedDuration: 45
    },
    {
        title: 'Understanding Risk Management',
        description: 'Learn essential risk management strategies for trading',
        content: `
# Risk Management in Stock Trading

Risk management is crucial for long-term trading success.

## Key Risk Management Concepts

### Position Sizing
- Never risk more than 1-2% of your account on a single trade
- Calculate position size based on stop-loss level
- Adjust size based on volatility

### Stop-Loss Orders
- Always use stop-loss orders
- Place stops at logical levels
- Consider volatility when setting stops

### Risk-Reward Ratio
- Aim for at least 2:1 risk-reward ratio
- Higher ratios for trend trading
- Lower ratios for range trading

### Portfolio Diversification
- Trade different sectors
- Mix growth and value stocks
- Consider market capitalization
- Don't put all eggs in one basket

## Risk Management Rules
1. Plan your trade
2. Trade your plan
3. Know your exit before entry
4. Never average down on losing trades
5. Keep a trading journal

Remember: Protecting capital is more important than making profits.`,
        order: 3,
        category: 'risk-management',
        difficulty: 'beginner',
        estimatedDuration: 40
    }
];

const quizzes = [
    {
        lessonId: null, // Will be set after lessons are created
        questions: [
            {
                questionText: 'What does a stock represent?',
                options: [
                    { text: 'A loan to a company', isCorrect: false },
                    { text: 'Ownership in a company', isCorrect: true },
                    { text: 'A company\'s debt', isCorrect: false },
                    { text: 'A company\'s profit', isCorrect: false }
                ],
                explanation: 'A stock represents partial ownership (equity) in a company.'
            },
            {
                questionText: 'What is the spread in stock trading?',
                options: [
                    { text: 'The difference between a stock\'s high and low price', isCorrect: false },
                    { text: 'The difference between the bid and ask price', isCorrect: true },
                    { text: 'The total trading volume', isCorrect: false },
                    { text: 'The price movement over time', isCorrect: false }
                ],
                explanation: 'The spread is the difference between the highest bid (buy) price and lowest ask (sell) price.'
            },
            {
                questionText: 'Which type of order guarantees execution at the current market price?',
                options: [
                    { text: 'Limit order', isCorrect: false },
                    { text: 'Stop order', isCorrect: false },
                    { text: 'Market order', isCorrect: true },
                    { text: 'Day order', isCorrect: false }
                ],
                explanation: 'A market order executes immediately at the best available current market price.'
            }
        ],
        passingScore: 70
    },
    {
        lessonId: null, // Will be set after lessons are created
        questions: [
            {
                questionText: 'What is technical analysis primarily based on?',
                options: [
                    { text: 'Company fundamentals', isCorrect: false },
                    { text: 'Price and volume data', isCorrect: true },
                    { text: 'Economic indicators', isCorrect: false },
                    { text: 'Company news', isCorrect: false }
                ],
                explanation: 'Technical analysis primarily studies historical price and volume data to predict future movements.'
            },
            {
                questionText: 'What does RSI stand for in technical analysis?',
                options: [
                    { text: 'Really Strong Investment', isCorrect: false },
                    { text: 'Rapid Stock Index', isCorrect: false },
                    { text: 'Relative Strength Index', isCorrect: true },
                    { text: 'Rising Stock Indicator', isCorrect: false }
                ],
                explanation: 'RSI (Relative Strength Index) is a momentum indicator that measures the speed and magnitude of price changes.'
            },
            {
                questionText: 'Which chart type shows opening, high, low, and closing prices?',
                options: [
                    { text: 'Line chart', isCorrect: false },
                    { text: 'Candlestick chart', isCorrect: true },
                    { text: 'Area chart', isCorrect: false },
                    { text: 'Dot plot', isCorrect: false }
                ],
                explanation: 'Candlestick charts show opening, high, low, and closing prices in a single candlestick.'
            }
        ],
        passingScore: 70
    },
    {
        lessonId: null, // Will be set after lessons are created
        questions: [
            {
                questionText: 'What is the recommended maximum risk per trade?',
                options: [
                    { text: '10% of account', isCorrect: false },
                    { text: '5% of account', isCorrect: false },
                    { text: '1-2% of account', isCorrect: true },
                    { text: '25% of account', isCorrect: false }
                ],
                explanation: 'To manage risk effectively, traders should not risk more than 1-2% of their account on a single trade.'
            },
            {
                questionText: 'What is a good risk-reward ratio for trend trading?',
                options: [
                    { text: '1:1', isCorrect: false },
                    { text: 'At least 2:1', isCorrect: true },
                    { text: '1:2', isCorrect: false },
                    { text: '0.5:1', isCorrect: false }
                ],
                explanation: 'A risk-reward ratio of at least 2:1 means the potential profit is twice the potential loss.'
            },
            {
                questionText: 'Which of these is NOT a good risk management practice?',
                options: [
                    { text: 'Using stop-loss orders', isCorrect: false },
                    { text: 'Diversifying your portfolio', isCorrect: false },
                    { text: 'Averaging down on losing trades', isCorrect: true },
                    { text: 'Keeping a trading journal', isCorrect: false }
                ],
                explanation: 'Averaging down on losing trades can increase risk exposure and lead to larger losses.'
            }
        ],
        passingScore: 70
    }
];

const badges = [
    {
        name: 'Trading Fundamentals',
        description: 'Complete the Introduction to Stock Trading lesson',
        image: 'badges/trading-fundamentals.png',
        criteria: 'COMPLETE_BASICS_LESSON',
        category: 'achievement'
    },
    {
        name: 'Technical Analyst',
        description: 'Complete the Technical Analysis Fundamentals lesson',
        image: 'badges/technical-analyst.png',
        criteria: 'COMPLETE_TECHNICAL_LESSON',
        category: 'achievement'
    },
    {
        name: 'Risk Manager',
        description: 'Complete the Risk Management lesson',
        image: 'badges/risk-manager.png',
        criteria: 'COMPLETE_RISK_LESSON',
        category: 'achievement'
    },
    {
        name: 'Perfect Score',
        description: 'Score 100% on any quiz',
        image: 'badges/perfect-score.png',
        criteria: 'PERFECT_QUIZ_SCORE',
        category: 'achievement'
    },
    {
        name: 'Learning Streak',
        description: 'Complete lessons for 7 consecutive days',
        image: 'badges/learning-streak.png',
        criteria: '7_DAY_STREAK',
        category: 'milestone'
    }
];

const seedEducation = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Clear existing data
        await Promise.all([
            Lesson.deleteMany({}),
            Quiz.deleteMany({}),
            Badge.deleteMany({})
        ]);
        console.log('Cleared existing education data...');

        // Insert lessons
        const createdLessons = await Lesson.insertMany(lessons);
        console.log('Lessons seeded successfully!');

        // Update quiz lessonIds and insert quizzes
        quizzes[0].lessonId = createdLessons[0]._id; // Intro lesson quiz
        quizzes[1].lessonId = createdLessons[1]._id; // Technical analysis quiz
        quizzes[2].lessonId = createdLessons[2]._id; // Risk management quiz
        
        await Quiz.insertMany(quizzes);
        console.log('Quizzes seeded successfully!');

        // Insert badges
        await Badge.insertMany(badges);
        console.log('Badges seeded successfully!');

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding education data:', error);
        process.exit(1);
    }
};

seedEducation();
