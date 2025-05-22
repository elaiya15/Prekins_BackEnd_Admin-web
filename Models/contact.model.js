const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const enquiriesSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile_number: String,
  subject: String,
  message: String,
  received_on: { type: Date, default: new Date() },
  status: { type: String, default: "New" },
});

const Enquiries = mongoose.model(
  process.env.DB_COLLECTION_SIX,
  enquiriesSchema
);

module.exports = Enquiries;
