const Enquiries = require("../Models/contact.model.js");

const enquiresController = {
  getAll: async (req, res) => {
    const { page = 1, limit = 15, search = "", status, from, to } = req.query;

    // Ensure page and limit are numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Prepare search conditions
    const searchConditions = [];

    if (search) {
      searchConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile_number: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { recieved_on_str: { $regex: search, $options: "i" } },
        ],
      });
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
          received_on: {
            $gte: fromDate,
            $lte: new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1), // Include until the end of the `toDate`
          },
        });
      } else {
        searchConditions.push({
          received_on: { $gte: new Date(from), $lte: new Date(to) },
        });
      }
    }

    const queryConditions = searchConditions.length
      ? { $and: searchConditions }
      : {};

    try {
      const enquiries = await Enquiries.aggregate([
        {
          $addFields: {
            recieved_on_str: {
              $dateToString: {
                format: "%d-%m-%Y", // Adjust the format as needed
                date: "$received_on",
              },
            },
          },
        },
        { $match: queryConditions },
        { $sort: { _id: -1 } },
        {
          $facet: {
            statusNull: [{ $match: { status: "New" } }],
            statusSeen: [{ $match: { status: "Seen" } }],
          },
        },
        {
          $project: {
            enquiries: { $concatArrays: ["$statusNull", "$statusSeen"] },
          },
        },
        { $unwind: "$enquiries" },
        { $replaceRoot: { newRoot: "$enquiries" } },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ]);
      const totalItems = await Enquiries.countDocuments(queryConditions); // Get total count of matching documents
      const TotalPages = Math.ceil(totalItems / limitNum);
      return res.status(200).json({
        message: "Data Fetched Successfully",
        enquiries,
        totalItems,
        TotalPages,
        CurrentPage: parseInt(page),
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
      const enquiries = await Enquiries.findById(req.params.id);
      if (!enquiries) {
        return res.status(404).json({
          message: "Enquiries not found",
        });
      }
      return res.status(200).json({
        message: "Data Fetched Successfully",
        enquiries,
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
      const newEnquiries = new Enquiries(req.body.updatedUserInfo);
      await newEnquiries.save();
      
      
      return res.status(201).json({
        message: "Message Sent successfully"
        
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
      const enquiries = await Enquiries.findById(req.params.id);
      if (!enquiries) {
        return res.status(404).json({
          message: "Enquiries not found",
        });
      }
      const updateEnquiries = await Enquiries.findByIdAndUpdate(
        enquiries._id,
        req.body
      );
      return res.status(201).json({
        message: "Status updated successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
};
module.exports = enquiresController;
