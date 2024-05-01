const mongoose = require("mongoose");

const sauceschema = new mongoose.Schema({
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

const sauces = mongoose.model("sauces", sauceschema);
module.exports = sauces;
