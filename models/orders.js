const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    itemQuantityLevel: {
        type: Number,
        required: true
    },
    itemPrice: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
});

const orders = mongoose.model('orders', orderSchema);

module.exports = orders;
