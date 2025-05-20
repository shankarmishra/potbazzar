import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  forgotPassword, 
  resetPassword, 
  verifyPhone 
} from '../controllers/userControllers.js'; 
import verifyToken from '../Middleware/userMiddleware.js';  
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for forgot password
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many requests, please try again later.'
});

// Registration route
router.post('/register', register);

// Login route
router.post('/login', login);

// Serve the policy page at /api/users/policy
router.get('/policy', (req, res) => {
  res.render('/policy', { title: 'Policy' });
});

// Profile route (protected)
router.get('/profile', verifyToken, getProfile);

// Forgot password route (rate limited)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);


// Reset password route
router.post('/reset-password', resetPassword);

// Phone verification route
router.post('/verify-phone', verifyPhone);

export default router;
