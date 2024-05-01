const mongoose = require("mongoose");

const spicesSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	quantity: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
});

const spices = mongoose.model("spices", spicesSchema);
module.exports = spices;
