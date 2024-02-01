const mongoose = require("mongoose");

const communityschema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  communities: {
    type: [String],
    default: [],
  },
});

const Community = mongoose.model("Community", communityschema);
module.exports = Community;
