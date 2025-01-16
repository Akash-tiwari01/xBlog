const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:String,
    email:{type:String,unique:true},
    password:String,
    phoneNo:{type:String,unique:true}
});


const User = mongoose.model('User',userSchema);

module.exports = User;