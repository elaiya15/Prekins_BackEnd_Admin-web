const nodemailer = require('nodemailer');

async function sendOtpEmail(email, otp) {
    // console.log("nodemailer:",email,otp);
    
  if (!email) {
    throw new Error('Recipient email is not defined');
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.HOST,
      service: process.env.SERVICE,
      port: Number(process.env.EMAIL_PORT),
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.USER, // Use the correct sender email
      to: email, // Make sure email is not undefined
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = sendOtpEmail;
