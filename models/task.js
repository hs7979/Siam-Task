
var mongoose = require("mongoose");

var taskSchema = new mongoose.Schema({
    title:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String
    },
    post:String,
    image:{type:String , default:"https://cdn-images-1.medium.com/max/660/1*oIiXHYa4LnwuaDSKhOZvfQ@2x.png"},
    content:String,
    created:{type:Date , default:Date.now},
    responses:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"response"
        }
    ]
});


module.exports = mongoose.model("Task",taskSchema);