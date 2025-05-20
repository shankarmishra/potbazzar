import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Models
import Category from './src/models/categoryModels.js';
import Product from './src/models/productModels.js';

// Route file imports
import userRoutes from './src/routes/userRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import localRoutes from './src/routes/local.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
// import homeRoutes from './src/routes/homeRoutes.js';
// import adminProductRoutes from './src/routes/adminProductRoutes.js'; // Admin product routes
import adminRoutes from './src/routes/adminRoutes.js';
import connect from './src/config/connect.js';

// Create an Express application
const app = express();

// Fix `__dirname` for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse form data
import cookieParser from 'cookie-parser';
app.use(cookieParser()); // Parse cookies

// Middleware to log API hit details
app.use((req, res, next) => {
    const now = new Date();
    console.log(`[${now.toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'src', 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Admin Routes
app.use('/admin', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
app.use('/admin', adminRoutes); // Use admin routes

// API Routes
app.use('/', localRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/category', categoryRoutes);
// app.use('/', homeRoutes);        // Home page and landing

// Global error handler (should be after all routes)
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500);
    // For API requests, send JSON. For others, render error page.
    if (req.originalUrl.startsWith('/api/')) {
        res.json({ message: err.message || 'Internal Server Error' });
    } else {
        res.render('error', { message: err.message || 'Internal Server Error' });
    }
});

// Start the server function
const start = async () => {
    const PORT = process.env.PORT || 3000;
    const HOST = '0.0.0.0';

    try {
        // Connect to MongoDB
        await connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        app.listen(PORT, HOST, () => {
            console.log(`✅ Server running at: http://localhost:${PORT}`);
            console.log(`✅ Admin dashboard available at: http://localhost:${PORT}/admin`);
        });
    } catch (error) {
        console.error('❌ Error during server startup:', error);
        process.exit(1);
    }
};

// Start the application
start();