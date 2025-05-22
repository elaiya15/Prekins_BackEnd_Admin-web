const gallery = require("../Models/gallery.model.js");
const fs = require("fs");
const galleryController = {
  getAll: async (req, res) => {
    try {
      const galleryData = await gallery.find().sort({ _id: -1 });
      return res.status(200).json({
        message: "Data Fetched Successfully",
        galleryData,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  getSingle: async (req, res) => {
    try {
      const galleryData = await gallery.findById(req.params.id);
      if (!galleryData) {
        return res.status(404).json({
          message: "Gallery not found",
        });
      }
      return res.status(200).json({
        message: "Data Fetched Successfully",
        galleryData,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  addNewFiles: async (req, res) => {
    try {
      if (req.file == undefined) {
        return res.status(400).json({ message: "No file selected" });
      }
      const newGallery = new gallery({
        name: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
      await newGallery.save();
      const galleryData = await gallery.find().sort({ _id: -1 });
      return res
        .status(201)
        .json({ message: "File Uploaded Successfully", galleryData });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  addNewLinks: async (req, res) => {
    try {
      const newGallery = new gallery({
        path: req.body.path,
      });
      await newGallery.save();
      const galleryData = await gallery.find().sort({ _id: -1 });
      return res
        .status(201)
        .json({ message: "File Uploaded Successfully", galleryData });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  update: async (req, res) => {
    try {
      const galleryData = await gallery.findById(req.params.id);
      if (!galleryData) {
        return res.status(404).json({
          message: "Gallery not found",
        });
      }
      const updateGallery = await gallery.findByIdAndUpdate(
        galleryData._id,
        req.body
      );
      return res.status(201).json({
        message: "Gallery updated successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  delete: async (req, res) => {
    try {
      const galleryList = await gallery.findById(req.params.id);
      if (!galleryList) {
        return res.status(404).json({
          message: "Gallery not found",
        });
      }
      if (!galleryList.path.includes("https")) {
        const fileExist = await fs.existsSync(galleryList.path);
        if (fileExist) {
          await fs.unlink(galleryList.path, (err) => {
            if (err) throw err;
          });
        }
      }
      const deleteGallery = await gallery.findByIdAndDelete(galleryList._id);
      const galleryData = await gallery.find().sort({ _id: -1 });
      return res.status(201).json({
        message: "Gallery deleted successfully",
        galleryData,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
};
module.exports = galleryController;
