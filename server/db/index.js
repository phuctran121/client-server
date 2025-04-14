const mongoose = require('mongoose');

// // Replace <db_password> with your actual database password
const uri = 'mongodb+srv://mongo:mongo@cluster0.qw8c9jj.mongodb.net/Product?retryWrites=true&w=majority&appName=Cluster0';


const connectMongoDB = async () => {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 1000, // timeout to 10 seconds
            socketTimeoutMS: 15000, // socket timeout to 15 seconds
        });
        console.log('✅ MongoDB connected successfully'); 
    } catch (error) {
        console.error(`Error connection to mongoDB: ${error.message}`);
        process.exit(1);
    }
}
module.exports = connectMongoDB;

