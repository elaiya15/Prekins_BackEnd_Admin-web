const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.DB_URL);
const db_connection = mongoose.connection;
db_connection.on("error", (error) => {
  console.log(`Error: connecting to Mongoose database ${error}`);
});

module.exports = db_connection;
