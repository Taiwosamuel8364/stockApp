require('dotenv').config();
const express = require("express");
const connectDB = require('./config/db');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/feed', require('./routes/newsRoutes'));
app.use('/api/trading', require('./routes/tradingRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));

// Basic welcome route
app.get("/", (req, res) => {    
  res.send("Welcome to the Stock Exchange API");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server after successful database connection
const startServer = async () => {
  try {
    await connectDB(); // Wait for database connection
    app.listen(PORT, () => {
      console.log(`Database connected successfully`);
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

