const jwt = require("jsonwebtoken");
const SignUp = require("../models/SigninSchema");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    // console.log("this is token");
    // console.log(token);
    const verifytoken = jwt.verify(token, process.env.KEYSECRET);
    // console.log(verifytoken);
    const rootuser = await SignUp.find({ _id: verifytoken._id });
    // console.log("rot: ", rootuser);
    if (!rootuser) {
      throw new Error("user not found");
    }
    req.token = token;
    req.rootuser = rootuser;
    req.userid = rootuser[0]._id;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ status: 401, message: "unauthorised, no token provide" });
  }
};

module.exports = authenticate;
