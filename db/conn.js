const mongoose = require("mongoose");
const DB = process.env.DB;
mongoose
  .connect(DB, {})
  .then(() => console.log("connection start"))
  .catch((err) => {
    console.log(err.message);
    
  });

