const mongoose = require('mongoose');

// Define the schema for the "product" collection
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mssv: { type: String, required: true },
    class: { type: String, required: true  },
}, { collection: 'product' }); // Explicitly set the collection name

// Create the model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
