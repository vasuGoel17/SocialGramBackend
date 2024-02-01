const mongoose = require("mongoose");

const postschema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    trim: true,
  },
  caption: {
    type: String,
  },
  location: {
    type: String,
  },
  posturl: {
    type: String,
    require: true,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  date: {
    type: Number,
    require: true,
  },
  month: {
    type: String,
    require: true,
  },
  year: {
    type: Number,
    require: true,
  },
});

const Post = mongoose.model("Post", postschema);

module.exports = Post;
