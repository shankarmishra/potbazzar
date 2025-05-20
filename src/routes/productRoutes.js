import express from 'express';
import { getProducts, getProductDetails, submitReview } from '../controllers/productController.js';
import verifyToken from '../Middleware/userMiddleware.js';

const router = express.Router();

// Route to fetch products by category (public)
router.get('/products/:categoryId', getProducts);

// Route to fetch product details by ID (public)
router.get('/productdetails', getProductDetails);

// Route to submit a review (protected)
router.post('/submit-review', verifyToken, submitReview);

// Route to fetch products with optional subcategory (public)
router.get('/products', getProducts);

// Handle invalid routes for this module
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found in productRoutes',
  });
});

export default router;