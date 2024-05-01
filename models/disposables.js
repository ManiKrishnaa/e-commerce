const mongoose = require('mongoose');

const disposableschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
});

const disposables = mongoose.model('disposables', disposableschema);

module.exports = disposables;
