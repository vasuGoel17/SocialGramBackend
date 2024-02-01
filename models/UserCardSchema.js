const mongoose = require("mongoose");

const newfollowing = new mongoose.Schema({
  name: String,
  date: Number,
  month: String,
  year: Number,
});

const userCardSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    trim: true,
  },
  profilePhoto: {
    type: String,
  },
  posts: {
    type: Number,
    default: 0,
  },
  day: {
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
  location: {
    type: String,
    default: "N/A",
  },
  communities: {
    type: Number,
    default: 0,
  },
  commonCommunities: {
    type: Number,
    default: 0,
  },
  following: [newfollowing],
  followers: {
    type: [String],
    default: [],
  },
  interests: {
    type: [String],
  },
  bio: {
    type: String,
    default: "",
  },
  time: {
    type: Number,
  },
});

const UserCard = mongoose.model("UserCard", userCardSchema);

module.exports = UserCard;
