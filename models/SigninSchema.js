const mongoose = require("mongoose");
const validate = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userschema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    validate(value) {
      if (!validate.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: {
    type: String,
    require: true,
    // validate(value) {
    //   if (!validate.isStrongPassword(value)) {
    //     throw new Error(
    //       "Invalid Password, must have atleast 8 characters, 1 uppercase, 1 lowercase, 1 numeric and 1 special character"
    //     );
    //   }
    // },
  },
  profilePhoto: {
    type: String,
    require: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  day: {
    type: Number,
    require: true,
  },
  month: {
    type: String,
    require: true,
  },
  year: {
    type: Number,
    require: true,
  },
  time: {
    type: Number,
  },
  // verifytoken: {
  //   type: String,
  // },
});

userschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userschema.methods.generateAuthtoken = async function () {
  try {
    const token1 = jwt.sign({ _id: this._id }, process.env.KEYSECRET, {
      expiresIn: "8h",
    });
    this.tokens = this.tokens.concat({ token: token1 });
    await this.save();
    return token1;
  } catch (error) {
    res.status(404).json({ error: "some errors are there" });
  }
};

const SignUp = mongoose.model("SignUp", userschema);
module.exports = SignUp;
