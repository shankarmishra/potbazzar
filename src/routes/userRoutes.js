import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  verifyPhone,
  logout as logoutController
} from '../controllers/userControllers.js';

import { requireLogin, requireApiLogin } from '../Middleware/userMiddleware.js'; // <-- update import
import verifyToken from '../Middleware/userMiddleware.js';           // JWT-based middleware

const router = express.Router();

// Rate limiter for forgot password route
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

/** ---------- Public Routes ---------- **/

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Forgot password (rate-limited)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

// Phone number verification
router.post('/verify-phone', verifyPhone);

// Serve the policy page (EJS page)
router.get('/policy', (req, res) => {
  res.render('policy', { title: 'Policy' });
});


/** ---------- Protected Routes ---------- **/

// Profile route (session-auth for browser-based login)
router.get('/profile', requireLogin, getProfile);

// Profile route (session-auth for API: returns JSON error if not logged in)
router.get('/profile-api', requireApiLogin, getProfile);


/** ---------- Page Routes ---------- **/

// Home page (session-based page view)
router.get('/', requireLogin, (req, res) => {
  res.render('home', { user: res.locals.user });
});


/** ---------- Logout Route ---------- **/

// Logout (handles session or token cleanup)
router.post('/logout', logoutController);

export default router;
