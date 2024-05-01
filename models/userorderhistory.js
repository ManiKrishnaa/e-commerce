const mongoose = require('mongoose');

const userOrderHistorySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'orders'
        }
    ],
    orderId: {
        type: String,
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
});

const UserOrderHistory = mongoose.model('userorderhistory', userOrderHistorySchema);

module.exports = UserOrderHistory;
