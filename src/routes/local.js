import express from 'express';
import { showHomePage, getProducts } from '../controllers/productController.js';

const router = express.Router();

// Home page
router.get('/', showHomePage);

// Public pages
router.get('/login', (req, res) => res.render('login'));
router.get('/policy', (req, res) => res.render('policy'));
router.get('/register', (req, res) => res.render('register'));
router.get('/blog', (req, res) => res.render('blog'));
router.get('/cart', (req, res) => res.render('cart'));
router.get('/forgot-password', (req, res) => res.render('forgot-password'));
router.get('/checkout', (req, res) => {
  res.render('checkoutpage');
});
router.get('/products', getProducts);

// Admin Login and Register Pages
// Add admin routes here if needed, e.g.:
// router.get('/admin/login', (req, res) => res.render('admin-login'));

export default router;