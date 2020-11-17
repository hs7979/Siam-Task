var mongoose = require("mongoose");

var eventSchema = new mongoose.Schema({
    title:String,
    image:{type:String , default:"https://cdn-images-1.medium.com/max/660/1*oIiXHYa4LnwuaDSKhOZvfQ@2x.png"},
    content:String,
    coords:String,
    fee:String,
    contact:Number,
    edate:String,
    price:String,
    fest: String
});


module.exports = mongoose.model("Event",eventSchema);