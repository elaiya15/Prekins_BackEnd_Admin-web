const express = require("express");
const galleryController = require("../Controllers/gallery.controller.js");
const { upload } = require("../Utilities/uploads.js");
const { authentication } = require("../Middlewares/authentication.js");
const galleryRouter = express.Router();

galleryRouter.get("/list", galleryController.getAll);
galleryRouter.get("/:id/data", galleryController.getSingle);
galleryRouter.post(
  "/files/add/new",
  authentication,
  upload.single("files"),
  galleryController.addNewFiles
);
galleryRouter.post(
  "/link/add/new",
  authentication,
  galleryController.addNewLinks
);
galleryRouter.put("/:id/update", authentication, galleryController.update);
galleryRouter.delete("/:id/delete", authentication, galleryController.delete);

module.exports = galleryRouter;
