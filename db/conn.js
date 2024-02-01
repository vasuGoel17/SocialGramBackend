const mongoose = require("mongoose");
const DB = process.env.DB;
mongoose
  .connect(DB, {})
  .then(() => console.log("connection start"))
  .catch((err) => {
    console.log("error in connecting to mongoDB as: ", err.message);
  });
