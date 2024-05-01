const mongoose = require("mongoose");

const riceschema = new mongoose.Schema({
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

const rice = mongoose.model("rice", riceschema);

module.exports = rice;
