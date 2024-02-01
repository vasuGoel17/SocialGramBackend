const mongoose = require("mongoose");

const likeschema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    unique: true,
  },
  usernames: {
    type: [String],
    default: [],
  },
});

const Like = mongoose.model("Like", likeschema);

module.exports = Like;
