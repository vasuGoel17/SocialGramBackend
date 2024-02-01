// const mongoose = require("mongoose");
// const DB = process.env.DB;
// mongoose
//   .connect(DB, {})
//   .then(() => console.log("connection start"))
//   .catch((err) => {
//     console.log("error in connecting to mongoDB as: ", err.message);
//   });

const mongoose = require("mongoose");
const DB = process.env.DB;

mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Event listeners for MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Graceful shutdown on application termination
process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log(
      "Mongoose connection terminated due to application termination"
    );
    process.exit(0);
  });
});
