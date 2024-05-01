const mongoose = require("mongoose");

const snacksSchema = new mongoose.Schema({
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

const snacks = mongoose.model("snacks", snacksSchema);
module.exports = snacks;
