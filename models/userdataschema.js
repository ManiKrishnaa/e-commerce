const mongoose = require('mongoose');

const userdataschema = new mongoose.Schema({
    name : {type : String,required : true},
    email : {type : String,required : true,unique : true},
    mobile : {type : Number,required : true,unique : true},
    address : {type : String,required : true},
    password : {type : String,required : true}
});

module.exports = mongoose.model('userdataschema',userdataschema);