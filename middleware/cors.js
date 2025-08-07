const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL        // ✅ Production frontend URL
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Support legacy browsers
};

module.exports = cors(corsOptions);
