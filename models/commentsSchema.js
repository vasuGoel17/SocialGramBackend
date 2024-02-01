const mongoose = require("mongoose");

const newcommentschema = new mongoose.Schema({
  username: String,
  comment: String,
  time: Number,
});

const commentschema = new mongoose.Schema({
  postId: {
    type: String,
  },
  comments: [newcommentschema],
});

const Comment = new mongoose.model("Comment", commentschema);
module.exports = Comment;
