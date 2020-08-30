
var mongoose = require("mongoose");

var responseSchema = new mongoose.Schema({
    query:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        username:String,
        created:{type:Date, default:Date.now}
    }
});

module.exports = mongoose.model("response",responseSchema);