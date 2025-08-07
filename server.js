// const express = require('express');
// const dotenv = require('dotenv');
// dotenv.config();
// const cors = require('cors'); // ✅ FIXED: use standard cors package
// const morgan = require('morgan');
// const session = require('express-session');
// const passport = require('passport');
// require('./config/passport');

// const jwt = require('jsonwebtoken'); // ✅ Add JWT
// const connect = require('./config/db');
// const routes = require('./Routes/routes');
// const authRoutes = require('./Routes/auth');

// connect();
// const app = express();

// app.use(express.json());
// app.use(morgan('dev'));
// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true,
// }));

// // Session required for OAuth flow
// app.use(session({ secret: 'randomsecret', resave: false, saveUninitialized: false }));

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

// // OAuth2 + JWT handler
// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// app.get('/auth/google/callback', passport.authenticate('google', {
//   failureRedirect: '/login',
//   session: false // ✅ Disable session post-login (JWT instead)
// }), (req, res) => {
//   const user = req.user;

//   // ✅ Sign JWT
//   const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

//   // ✅ Redirect to frontend with token
//   res.redirect(`http://localhost:5173/?token=${token}`);
// });

// // Routes
// app.use('/api/auth', authRoutes);  // Google OAuth routes
// app.use('/api/Routes', routes);    // Your coin flip routes

// const PORT = process.env.PORT || 8976;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const jwt = require('jsonwebtoken');
const connect = require('./config/db');
const routes = require('./Routes/routes');
const authRoutes = require('./Routes/auth');

connect();
const app = express();

app.use(express.json());
app.use(morgan('dev'));

// ✅ Production-ready CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',        // Vite dev server
    'http://localhost:3000',        // React dev server
    process.env.FRONTEND_URL        // Production frontend URL
  ].filter(Boolean), // Remove undefined values
  credentials: true,
}));

// Session required for OAuth flow
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'randomsecret', 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// OAuth2 + JWT handler
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: false // Disable session post-login (JWT instead)
}), (req, res) => {
  const user = req.user;

  // ✅ Sign JWT with user data
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );

  // ✅ Production-ready redirect URL
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendURL}?token=${token}`);
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'quantum-coin-flip-backend'
  });
});

// Routes
app.use('/api/auth', authRoutes);  // Google OAuth routes
app.use('/api/Routes', routes);    // Your coin flip routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

const PORT = process.env.PORT || 8976;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
