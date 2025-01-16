const mongoose = require('mongoose');

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected Successfully");
    }catch(err){
        console.log(`Error in connecting MongoDB : ${err}`);
    }
}

module.exports = connectDB;