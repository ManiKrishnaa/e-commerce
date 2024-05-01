const mongoose = require('mongoose');

const cleanerschema = new mongoose.Schema({
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

const cleaners = mongoose.model('cleaners', cleanerschema);

module.exports = cleaners;
