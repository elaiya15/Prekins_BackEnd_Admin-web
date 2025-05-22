const Blogs = require("../Models/blogs.model.js");
const fs = require("fs");

const blogsController = {
  getAll: async (req, res) => {
    const { search = "" } = req.query;

    // Prepare search conditions
    const searchConditions = [];

    if (search) {
      searchConditions.push({ title: { $regex: search, $options: "i" } });
    }

    const queryConditions = searchConditions.length
      ? { $and: searchConditions }
      : {};

    try {
      const blogs = await Blogs.aggregate([
        { $match: queryConditions },
        { $sort: { _id: -1 } },
      ]);
      return res.status(200).json({
        message: "Data Fetched Successfully",
        blogs,
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
      const blogs = await Blogs.findById(req.params.id);
      if (!blogs) {
        return res.status(404).json({
          message: "Blog not found",
        });
      }
      return res.status(200).json({
        message: "Data Fetched Successfully",
        blogs,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  addNew: async (req, res) => {
    try {
      if (req.file == undefined) {
        return res.status(400).json({ message: "No file selected" });
      }
      req.body.image = req.file.path;
      const newBlog = new Blogs(req.body);
      await newBlog.save();
      return res.status(201).json({
        message: "Blog uploaded successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  update: async (req, res) => {
    try {
      const blogs = await Blogs.findById(req.params.id);
      if (!blogs) {
        return res.status(404).json({
          message: "Blog not found",
        });
      }
      if (req.file !== undefined) {
        req.body.image = req.file.path;
        const fileExist = await fs.existsSync(blogs.image);
        if (fileExist) {
          await fs.unlink(blogs.image, (err) => {
            if (err) throw err;
          });
        }
      } else {
        req.body.image = req.body.files;
        delete req.body.files;
      }

      const updateBlog = await Blogs.findByIdAndUpdate(blogs._id, req.body);
      return res.status(201).json({
        message: "Blog updated successfully",
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
      const blogsData = await Blogs.findById(req.params.id);
      if (!blogsData) {
        return res.status(404).json({
          message: "Blog not found",
        });
      }
      const fileExist = await fs.existsSync(blogsData.image);
      if (fileExist) {
        await fs.unlink(blogsData.image, (err) => {
          if (err) throw err;
        });
      }
      await Blogs.findByIdAndDelete(blogsData._id);
      const blogs = await Blogs.find().sort({ _id: -1 });
      return res.status(201).json({
        message: "Blog deleted successfully",
        blogs,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
};
module.exports = blogsController;
