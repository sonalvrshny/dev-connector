const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

// putting mongoose.connect(db) in a function that can be called later
const connectDB = async () => {
    try {
        await mongoose.connect(db);
        console.log('Mongo connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB
