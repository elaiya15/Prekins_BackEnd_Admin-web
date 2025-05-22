const express = require("express");
const blogsController = require("../Controllers/blogs.controller.js");
const { upload } = require("../Utilities/uploads.js");
const { authentication } = require("../Middlewares/authentication.js");
const blogsRouter = express.Router();

blogsRouter.get("/list", blogsController.getAll);
blogsRouter.get("/:id/data", blogsController.getSingle);
blogsRouter.post(
  "/add/new",
  authentication,
  upload.single("files"),
  blogsController.addNew
);
blogsRouter.put(
  "/:id/update",
  authentication,
  upload.single("files"),
  blogsController.update
);
blogsRouter.delete("/:id/delete", authentication, blogsController.delete);

module.exports = blogsRouter;
