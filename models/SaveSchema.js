const mongoose = require("mongoose");

const saveschema = new mongoose.Schema({
  username: {
    type: String,
  },
  postIDs: {
    type: [String],
    default: [],
  },
});

const Save = mongoose.model("Save", saveschema);
module.exports = Save;
