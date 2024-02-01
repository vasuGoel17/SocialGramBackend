const mongoose = require("mongoose");

const newpost = new mongoose.Schema({
  username: String,
  date: Number,
  month: String,
  comName: String,
  year: Number,
  url: { type: String, default: "" },
  text: { type: String, default: "" },
  comments: [{ type: String, default: "" }],
  likes: [{ type: String, default: "" }],
});

const Comschema = new mongoose.Schema({
  comName: {
    type: String,
  },
  name: {
    type: String,
  },
  members: {
    type: Number,
    default: 0,
  },
  comPost: [newpost],
});

const Comarr = new mongoose.model("Comarr", Comschema);
module.exports = Comarr;
