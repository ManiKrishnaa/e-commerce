const mongoose = require('mongoose');

const toiletarieschema = new mongoose.Schema({
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

const toiletaries = mongoose.model('toiletaries', toiletarieschema);

module.exports = toiletaries;
