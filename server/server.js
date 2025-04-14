require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { authenticate } = require('./middleware/auth');
const connectMongoDB = require('./db');
const Product = require('./models/product');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas using the existing connection function
connectMongoDB();

// Routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ 
    message: 'This is a protected route', 
    user: req.user 
  });
});

// GET all products - Protected
app.get('/api/objects', authenticate, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error: error.message });
    }
});

// Root route - Protected
app.get('/', authenticate, async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error: error.message });
    }
});

// GET single product by ID - Protected
app.get('/api/objects/:id', authenticate, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error: error.message });
    }
});

// POST new product - Protected
app.post('/api/objects', authenticate, async (req, res) => {
    const { name, class: className, mssv } = req.body;

    // Validate required fields
    if (!name || !className || !mssv) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Check if a product with the same mssv already exists
        const existingProduct = await Product.findOne({ mssv });
        if (existingProduct) {
            return res.status(400).json({ message: 'MSSV already exists' });
        }

        // Create a new product instance
        const newProduct = new Product({
            name,
            class: className,
            mssv: mssv,
        });

        // Save the product to the database
        const savedProduct = await newProduct.save();
        return res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error saving product', error: error.message });
    }
});

// PUT update product - Protected
app.put('/api/objects/:id', authenticate, async (req, res) => {
    const { name, class: className } = req.body;
    
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, class: className },
            { new: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// DELETE product - Protected
app.delete('/api/objects/:id', authenticate, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});