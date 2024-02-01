const express = require("express");
require("dotenv").config();
require("./db/conn");
const router = require("./routes/router");
const app = express();
const cors = require("cors");
const { json } = require("body-parser");

app.use((req, res, next) => {
  const contentLength = req.headers["content-length"];
  // console.log(`Request size: ${contentLength} bytes`);
  next();
});

app.use(cors());
app.use(express.static("uploads"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  console.log("working fine");
  res.status(201, json({ message: "goog going" }));
});

app.use(router);

app.listen(PORT, () => {
  console.log(`Server is successfully working at port ${PORT}`);
});
