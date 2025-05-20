import express from 'express';
import { createTransaction, createOrder, getOrderbyUserId } from '../controllers/orderController.js';
import verifyToken from '../Middleware/userMiddleware.js'; // fixed casing

const router = express.Router();

// Async error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Create a transaction (protected)
router.post('/transaction', verifyToken, asyncHandler(createTransaction));

// Get orders by user ID (protected)
router.get('/:userId', verifyToken, asyncHandler(getOrderbyUserId));

// Create an order (protected)
router.post('/', verifyToken, asyncHandler(createOrder));

router.get('/checkoutpage', (req, res) => {
    res.render('checkoutpage');
}
);

// Global error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// Optional: Handle invalid routes for this module
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Order route not found',
    });
});

export default router;
