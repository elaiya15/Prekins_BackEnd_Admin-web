const { generateToken } = require("../Middlewares/authentication.js");
const User = require("../Models/user.model.js");
const { comparePassword, hashPassword } = require("../Utilities/hashing.js");
const sendOtpEmail = require("../Utilities/email.js");
const generateOtp = require("../Utilities/generateOtp.js");

const userController = {
  signup: async (req, res) => {
    const { username } = req.body;
    try {
      const user = await User.find({ username });
      if (user.length !== 0) {
        return res.status(400).json({
          message: "Username already exists",
        });
      } else {
        const encryptedPassword = hashPassword(req.body.password);
        req.body.password = encryptedPassword;
        const newUser = new User(req.body);
        await newUser.save();
        return res.status(201).json({
          message: "User created successfully",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  
  login: async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        const verify = comparePassword(user.password);
        if (verify !== password) {
          return res.status(400).json({
            message: "Invalid Credentials",
          });
        } else {
          const token = await generateToken(user);
          return res.status(200).json({
            message: "Login Successful",
            user: {
              name: user.name,
              username: user.username,
              access_to: user.access_to,
              isAdmin: user.isAdmin,
            },
            token,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  
  getAll: async (req, res) => {
    const { page = 1, limit = 15, search = "" } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const searchConditions = [{ isAdmin: false }];

    if (search) {
      searchConditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone_number: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          {
            access_to: {
              $elemMatch: {
                $regex: search,
                $options: "i",
              },
            },
          },
        ],
      });
    }

    const queryConditions = searchConditions.length
      ? { $and: searchConditions }
      : {};
    
    try {
      const user = await User.aggregate([
        { $match: queryConditions },
        { $sort: { _id: -1 } },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
      ]);

      const totalItems = await User.countDocuments(queryConditions);
      const TotalPages = Math.ceil(totalItems / limitNum);
      return res.status(200).json({
        message: "Data Fetched Successfully",
        user,
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
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      return res.status(200).json({
        message: "Data Fetched Successfully",
        user,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  updateAccess: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        user.access_to = req.body.access_to;
        await user.save();
        return res.status(200).json({
          message: "User Access Updated Successfully",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        await User.findByIdAndDelete(id);
        return res.status(200).json({
          message: "User Deleted Successfully",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
  forgetPassword: async (req, res) => {
    const { username } = req.body;
    const otp = generateOtp();
  
    try {
      // Fetch user with the email and isAdmin fields
      const user = await User.findOne({ username }).select('email isAdmin');
      // console.log('Fetched user:', user);
  
      if (user && user.isAdmin === true) {
        // Log the value of email before checking
        // console.log('Email value before check:', user.email);
  
        // Check if the email is properly set and not falsy
        if (!user.email || user.email === '') {
          // console.log('Email is undefined or empty'); // Debugging log
          return res.status(400).send('Email not found for the user.');
        }
  
        // Save the OTP to the user's record
        user.Otp = otp; // Ensure this matches the field in your schema
        await user.save();
  
        const email = user.email;
        // console.log('User email after check:', email);
  
        // Send the OTP via email
        const mailSent = await sendOtpEmail(email, otp);
  
        if (mailSent) {
          return res.status(200).send({ message: 'OTP sent to email.', email: email });
        } else {
          return res.status(500).send('Error while sending OTP email.');
        }
      } else {
        return res.status(404).send('Admin not found.');
      }
    } catch (error) {
      // console.error('Error sending OTP:', error);
      return res.status(500).send('Error sending OTP');
    }
  },
  
  
  
  VerifyforgetPassword: async (req, res) => {
    const { username, otp } = req.body;
    // console.log('Username and OTP:', username, otp);
  
    try {
      const user = await User.findOne({ username });
      // console.log('Fetched user:', user);
  
      if (!user) {
        return res.status(404).send('User not found.');
      }
      // Check if the OTP matches
      if (user.Otp === otp) {
        return res.status(200).send('OTP verified.');
      } else {
        return res.status(404).send('Wrong OTP.');
      }
    } catch (error) {
      // console.error('Error verifying OTP:', error);
      return res.status(500).send('Error verifying OTP.');
    }
  },
  
  
  Updateforgetpassword: async (req, res) => {
    const { username, newPassword } = req.body;
    
    try {
      const user = await User.findOne({ username });
  
      if (user) {
        // Encrypt the new password
        const encryptedPassword = hashPassword(newPassword);
        user.password = encryptedPassword;
  
        // Remove the Otp field from the user document
        user.Otp = undefined;
  
        // Save the updated user record
        await user.save(); 
  
        return res.status(200).send('Password Updated Successfully.');
      }
  
      return res.status(404).send('User not found.');
    } catch (error) {
      console.error('Error during password update:', error);
      return res.status(500).send('Catch Error: Password Update');
    }
  },
  

  getAdmin_forgetpassword: async (req, res) => {


    try {
    const user = await User.findOne({ isAdmin:true}).select(" isAdmin email username " );
      if (user) {
        return res.status(200).send({data:user});
      }
    } catch (error) {
      return res.status(404).send("Admin not Found");
    }

  },

};
module.exports = userController;
