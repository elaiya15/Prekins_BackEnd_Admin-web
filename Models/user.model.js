const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: Object,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  access_to: {
    type: [String],
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  Otp:{
    type: String,
  },
  email: {
    type: String,
  },
});

const User = mongoose.model(process.env.DB_COLLECTION_ONE, userSchema);

module.exports = User;
