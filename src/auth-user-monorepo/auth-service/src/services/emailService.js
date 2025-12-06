// auth-service/src/services/emailService.js
const nodemailer = require("nodemailer");
const config = require("../../../common/src/config"); // Import config to get env vars

// Configure the transporter with Gmail
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: process.env.MAIL_PORT || 587,
  secure: false, // Use TLS
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
  // Use production URL or localhost
  const baseUrl = process.env.FRONTEND_URL || "http://34.124.227.173:3000";
  const verificationUrl = `${baseUrl}/auth/verify-email/${token}`;

  const mailOptions = {
    from: `"Zalo Clone" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "Xác thực tài khoản Zalo Clone - Verify your Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0068FF;">Chào mừng đến với Zalo Clone!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
        <p>Vui lòng nhấp vào nút bên dưới để xác thực email của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #0068FF; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Xác thực tài khoản
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Hoặc copy link sau vào trình duyệt:</p>
        <p style="color: #0068FF; word-break: break-all;">${verificationUrl}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent to:", toEmail);
    console.log("📧 Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };