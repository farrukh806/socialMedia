const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
  image: {
    type: Buffer,
  },
  imageType: {
    type: String,
  },
  description: {
    type: String,
  },
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  comments:[
    {
    type:mongoose.Schema.Types.ObjectId,
    ref:'Comment'
    }
  ],
  likes:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});


postSchema.virtual("images").get(function () {
  if (this.image != null && this.imageType != null) {
    return `data:${this.imageType};charset=utf-8;base64,${this.image.toString("base64")}`;
  }
});

module.exports = mongoose.model("Post", postSchema);
