const jsonwebtoken = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const jwtSecret = process.env.JWT_SECRET_KEY;

const generateToken = async (user) => {
  const token = await jsonwebtoken.sign(
    {
      id: user._id,
      username: user.username,
      name: user.name,
    },
    jwtSecret,
    {
      expiresIn: "1d",
    }
  );
  return token;
};

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    const verify = await jsonwebtoken.verify(token, jwtSecret);

    if (verify) {
      next();
    }
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({
      message: "Unauthorized! Please login...",
    });
  }
};

module.exports = { generateToken, authentication };
