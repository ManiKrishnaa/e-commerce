const mongoose = require("mongoose");

const milkschema = new mongoose.Schema({
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

const milks = mongoose.model("milks", milkschema);

module.exports = milks;
