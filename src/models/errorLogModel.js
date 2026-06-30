const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
    message: String,
    stack: String,
    path: String,
    method: String,
    statusCode: Number,
    ip: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ErrorLog', errorLogSchema);