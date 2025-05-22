const Applicant = require("../Models/applicant.model.js");

const applicantController = {
  getAll: async (req, res) => {
    const {
      page = 1,
      limit = 15,
      search = "",
      designation,
      status,
      from,
      to,
    } = req.query;
    // Ensure page and limit are numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Prepare search conditions
    const searchConditions = [];

    if (search) {
      searchConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { designation: { $regex: search, $options: "i" } },
          { experience: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { applied_on_str: { $regex: search, $options: "i" } },
        ],
      });
    }
    if (designation) {
      searchConditions.push({ designation });
    }
    if (status) {
      searchConditions.push({ status });
    }
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      if (fromDate.getTime() === toDate.getTime()) {
        // When the `from` and `to` dates are the same, include all events on that day
        searchConditions.push({
          applied_on: {
            $gte: fromDate,
            $lt: new Date(fromDate.getTime() + 24 * 60 * 60 * 1000), // Include until the end of the day
          },
        });
      } else {
        searchConditions.push({
          applied_on: {
            $gte: fromDate,
            $lte: new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1), // Include until the end of the `toDate`
          },
        });
      }
    }
    const queryConditions = searchConditions.length
      ? { $and: searchConditions }
      : {};

    try {
      const applicants = await Applicant.aggregate([
        {
          $addFields: {
            applied_on_str: {
              $dateToString: {
                format: "%d-%m-%Y", // Adjust the format as needed
                date: "$applied_on",
              },
            },
          },
        },
        { $match: queryConditions },
        {
          $project: {
            applied_on_str: 0, // Optionally remove the applied_on_str field from the result
          },
        },
        { $sort: { _id: -1 } },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ]);

      const totalItems = await Applicant.countDocuments(queryConditions); // Get total count of matching documents
      const TotalPages = Math.ceil(totalItems / limitNum);
      const list = await Applicant.find().select("designation");
      const designations = [...new Set(list.map((item) => item.designation))];
      return res.status(200).json({
        message: "Data Fetched Successfully",
        applicants,
        totalItems,
        TotalPages,
        CurrentPage: parseInt(page),
        designations,
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
      const applicants = await Applicant.findById(req.params.id);
      if (!applicants) {
        return res.status(404).json({
          message: "Applicant not found",
        });
      }
      return res.status(200).json({
        message: "Data Fetched Successfully",
        applicants,
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
      req.body.resume = req.file.path;
      const newApplicant = new Applicant(req.body);
      await newApplicant.save();
      return res.status(201).json({
        message: "Applicantion Submitted successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  applicant_status: async (req, res) => {
    const { status, ReasonForStatus } = req.body;
  
    try {
      const applicant = await Applicant.findById({_id:req.params.id});
      if (!applicant) {
        return res.status(404).json({
          message: "Applicant not found",
        });
      }
 
  
      // Push new ReasonForStatus object into the array
      if (ReasonForStatus) {
        applicant.ReasonForStatus.push({
          status:ReasonForStatus.status,
          message:ReasonForStatus.message,
        });
      }
  
      // Update other applicant fields
      applicant.status = status ;
      // console.log(applicant.status);
      
      await applicant.save();
  
      return res.status(201).json({
        message: "Applicant updated successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  update: async (req, res) => {
    const { status } = req.body;
 
    try {
      const applicant = await Applicant.findByIdAndUpdate(
        {_id:req.params.id},
        { status: status },
        { new: true }
      );
      
      await applicant.save();
  
      return res.status(201).json({
        message: "seen updated successfully",
      });
    } catch (error) {
      // console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
};
module.exports = applicantController;
