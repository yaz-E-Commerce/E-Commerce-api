const mongoose = require('mongoose');

const connectDB = () => {
    mongoose
        .connect(process.env.CONNECTION_STRING, {
            dbName: 'shop-database',
        })
        .then(() => {
            console.log('Database connection is ready...');
        })
        .catch((err) => {
            console.log('Database connection failed:', err);
        });
};

module.exports = connectDB;