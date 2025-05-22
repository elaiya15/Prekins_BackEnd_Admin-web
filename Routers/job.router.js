const express = require("express");
const jobController = require("../Controllers/job.controller.js");
const { authentication } = require("../Middlewares/authentication.js");
const jobRouter = express.Router();

jobRouter.get("/list", jobController.getAll);
jobRouter.get("/:id/data", jobController.getSingle);
jobRouter.post("/add/new", authentication, jobController.addNew);
jobRouter.put("/:id/update", authentication, jobController.update);

module.exports = jobRouter;
