const mongoose = require('mongoose');

const cartschema = new mongoose.Schema({
    email : {type : String},
    itemid : {type : String,required : true},
    itemname : {type : String,required : true},
    itemquantity : {type : String,required : true},
    itemquantitylevel : {type : Number,required : true},
    itemprice : {type : String,required : true},   
});

const cart = mongoose.model('cart',cartschema);

module.exports = cart;