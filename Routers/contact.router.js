const express = require("express");
const enquiriesController = require("../Controllers/contact.controller.js");
const { authentication } = require("../Middlewares/authentication.js");
const enquiriesRouter = express.Router();

enquiriesRouter.get("/list", authentication, enquiriesController.getAll);
enquiriesRouter.get("/:id/data", authentication, enquiriesController.getSingle);
enquiriesRouter.post("/add/new", enquiriesController.addNew);
enquiriesRouter.put(
  "/:id/status/update",
  authentication,
  enquiriesController.update
);

module.exports = enquiriesRouter;
