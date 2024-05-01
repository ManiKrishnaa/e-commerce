const mongoose = require('mongoose');

const hygieneschema = new mongoose.Schema({
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

const hygiene = mongoose.model('hygienes', hygieneschema);

module.exports = hygiene;
