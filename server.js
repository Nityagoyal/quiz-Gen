require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const connect = require('./config/db');
const quizRoutes = require('./Routes/routes');
const authRoutes = require('./Routes/auth');
require('./config/passport'); // GoogleStrategy setup

// 1️⃣ Connect to MongoDB
connect();

const app = express();

// 2️⃣ Middleware
app.use(express.json());
app.use(morgan('dev'));

// 3️⃣ CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://quiz-gen-e0ql.onrender.com',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// 4️⃣ Initialize Passport (JWT-only, no session)
app.use(passport.initialize());

// 5️⃣ Routes
app.use('/api/quiz', quizRoutes);   // Quiz endpoints
app.use('/api/auth', authRoutes);   // Google OAuth endpoints

// 6️⃣ Health check route
app.get('/', (req, res) => res.send('API is running'));


// 7️⃣ Start server
const PORT = process.env.PORT || https://quiz-gen-e0ql.onrender.com;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
