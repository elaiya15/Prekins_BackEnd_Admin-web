const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const algorithm = "aes-256-cbc";
const secretKey = Buffer.from(process.env.SECRET_KEY, "utf8"); // Ensure the key is 32 bytes
const iv = crypto.randomBytes(16); // Initialization vector

const hashPassword = (password) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted,
  };
};

const comparePassword = (encryption) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(encryption.iv, "hex")
  );
  let decrypted = decipher.update(encryption.encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = { hashPassword, comparePassword };
