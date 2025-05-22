const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const db_connection = require("./Configs/Db.config.js");
const userRouter = require("./Routers/user.router.js");
const jobRouter = require("./Routers/job.router.js");
const galleryRouter = require("./Routers/gallery.router.js");
const blogsRouter = require("./Routers/blogs.router.js");
const applicantRouter = require("./Routers/applicant.router.js");
const enquiriesRouter = require("./Routers/contact.router.js");

dotenv.config();

const server = express();
const PORT = process.env.PORT || 5055;

server.use(
  cors({
    origin: [
      process.env.FRONTEND_URL_1,
      process.env.FRONTEND_URL_2,
      process.env.FRONTEND_LOCAL_URL_1,
      process.env.FRONTEND_LOCAL_URL_2,
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    exposedHeaders: ["Content-Type", "Authorization"],
  })
);
server.use(bodyParser.json({ limit: 10000 }));
server.use(bodyParser.urlencoded({ extended: true, limit: 10000 }));
server.use("/uploads", express.static(path.join(__dirname, "uploads")));
server.get("/", (req, res) => {
  res.send("Server is Live.");
});
server.use("/api/user", userRouter);
server.use("/api/job", jobRouter);
server.use("/api/applicant", applicantRouter);
server.use("/api/enquiries&messages", enquiriesRouter);
server.use("/api/blog", blogsRouter);
server.use("/api/gallery", galleryRouter);
server.listen(PORT, () => {
  console.log(`Server is Running on Port ${PORT}.`);
  db_connection.once("open", () => {
    console.log("Database is Connected.");
  });
});
