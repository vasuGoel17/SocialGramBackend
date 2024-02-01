const express = require("express");
require("dotenv").config();
require("./db/conn");
const router = require("./routes/router");
const app = express();
const cors = require("cors");

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
app.use(router);

app.get("/", async (req, res) => {
  console.log("working fine");
  res.status(200).json({ status: 200, message: "goog going" });
});

app.listen(PORT, () => {
  console.log(`Server is successfully working at port ${PORT}`);
});
