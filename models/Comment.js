const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true
    },
    commentAuthor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    createdAt:{
        type:Date,
        default: Date.now()
    }
});

module.exports = mongoose.model("Comment", commentSchema);