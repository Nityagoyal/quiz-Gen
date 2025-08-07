const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors'); // ✅ FIXED: use standard cors package
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const jwt = require('jsonwebtoken'); // ✅ Add JWT
const connect = require('./config/db');
const routes = require('./Routes/routes');
const authRoutes = require('./Routes/auth');

connect();
const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Session required for OAuth flow
app.use(session({ secret: 'randomsecret', resave: false, saveUninitialized: false }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// OAuth2 + JWT handler
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: false // ✅ Disable session post-login (JWT instead)
}), (req, res) => {
  const user = req.user;

  // ✅ Sign JWT
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // ✅ Redirect to frontend with token
  res.redirect(`http://localhost:5173/?token=${token}`);
});

// Routes
app.use('/api/auth', authRoutes);  // Google OAuth routes
app.use('/api/Routes', routes);    // Your coin flip routes

const PORT = process.env.PORT || 8976;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
