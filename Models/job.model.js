const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const jobSchema = new mongoose.Schema({
  designation: String,
  location: String,
  work_experience: String,
  preferred_skills: [String],
  job_summary: String,
  responsibilities_and_duties: [String],
  required_experience_and_qualifications: [String],
  posted_on: { type: Date, default: new Date() },
  updated_on: Date,
  status: String,
});

const Jobs = mongoose.model(process.env.DB_COLLECTION_TWO, jobSchema);

module.exports = Jobs;
