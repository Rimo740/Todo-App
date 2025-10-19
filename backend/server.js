// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // optional
const connectDB = require('./config/db');
const taskRoutes = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan ? morgan('dev') : (req, res, next) => next()); // safe: morgan optional

// Routes
app.use('/api/tasks', taskRoutes);

// Health
app.get('/', (req, res) => res.send('TODO API is running'));

// Error handler (after routes)
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
