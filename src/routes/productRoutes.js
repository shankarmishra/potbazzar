import express from 'express';
import { getProducts, getProductDetails, submitReview } from '../controllers/productController.js';
import verifyToken from '../Middleware/userMiddleware.js';
import Product from '../models/productModels.js';

const router = express.Router();

// Route to fetch products by category (public)
router.get('/products/:categoryId', getProducts);

// Route to fetch product details by ID (public)
router.get('/productdetails', getProductDetails);

// Route to submit a review (protected)
router.post('/submit-review', verifyToken, submitReview);

// Route to fetch products with optional subcategory (public)
router.get('/products', getProducts);

// Route to fetch stock for a product by ID (public)
router.get('/product/stock/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('stock');
    if (!product) {
      return res.status(404).json({ stock: 0, message: 'Product not found' });
    }
    res.json({ stock: product.stock });
  } catch (error) {
    res.status(500).json({ stock: 0, message: 'Error fetching stock' });
  }
});

// Handle invalid routes for this module
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found in productRoutes',
  });
});

export default router;