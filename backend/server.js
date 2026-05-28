require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', async (req, res) => {
  try {
    // Simple test query to database
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'WMS Express Backend is running and connected to Neon Database.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Failed to connect to database.',
      error: error.message
    });
  }
});

// Register routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Logistics & Supply Chain WMS API');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, prisma };
