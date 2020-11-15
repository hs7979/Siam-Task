var mongoose = require("mongoose");

var detailsSchema = new mongoose.Schema({
    RegNo: String,
    DOB: Date,
    board:{type:Boolean,default:false},
    post: String,
    email:String,
    contact: Number,
    insta: String,
    github:String,
    linkedIn:String,
    owner:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String,
    }
});

module.exports = mongoose.model("details",detailsSchema);