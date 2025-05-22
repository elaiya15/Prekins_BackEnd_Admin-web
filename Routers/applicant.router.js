const express = require("express");
const applicantController = require("../Controllers/applicant.controller.js");
const { authentication } = require("../Middlewares/authentication.js");
const { uploadResume } = require("../Utilities/uploads.js");
const applicantRouter = express.Router();

applicantRouter.get("/list", authentication, applicantController.getAll);
applicantRouter.get("/:id/data", authentication, applicantController.getSingle);
applicantRouter.post(
  "/apply",
  uploadResume.single("resume"),
  applicantController.addNew
);
applicantRouter.put(
  "/:id/status/update",
  authentication,
  applicantController.update
);
applicantRouter.put(
  "/:id/applicant_status/update",
  authentication,
  applicantController.applicant_status
);

module.exports = applicantRouter;
