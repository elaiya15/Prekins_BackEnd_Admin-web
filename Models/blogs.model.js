const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const blogsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  posted_on: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

const Blogs = mongoose.model(process.env.DB_COLLECTION_THREE, blogsSchema);

module.exports = Blogs;
