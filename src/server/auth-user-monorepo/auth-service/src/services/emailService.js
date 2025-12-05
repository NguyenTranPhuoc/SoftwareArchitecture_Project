// auth-service/src/services/emailService.js
const nodemailer = require("nodemailer");
const config = require("../../../common/src/config"); // Import config to get env vars

// Configure the transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Sends a verification email
 * @param {string} toEmail - Recipient's email
 * @param {string} token - Verification token
 */
const sendVerificationEmail = async (toEmail, token) => {
  // This is the link the user will click
  const verificationUrl = `http://localhost:3001/auth/verify-email/${token}`;

  const mailOptions = {
    from: '"Zalo Clone" <noreply@zaloclone.com>',
    to: toEmail,
    subject: "Verify your Zalo Clone Account",
    html: `
      <p>Thanks for registering!</p>
      <p>Please click the link below to verify your account:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.messageId);
    // This is the URL to preview the "fake" email on Ethereal
    console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendVerificationEmail };