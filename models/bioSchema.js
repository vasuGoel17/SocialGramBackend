const mongoose = require("mongoose");

const bioschema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    trim: true,
  },
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  interest: {
    type: [String],
  },
});

const Bio = new mongoose.model("bio", bioschema);
module.exports = Bio;
