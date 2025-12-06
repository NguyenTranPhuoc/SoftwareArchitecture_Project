// auth-service/src/services/smsService.js

/**
 * SMS Service for sending verification codes
 * Currently logs to console for development
 * Can be integrated with Twilio, AWS SNS, or other SMS providers
 */

/**
 * Sends a verification code via SMS
 * @param {string} phoneNumber - Recipient's phone number (e.g., +84901234567)
 * @param {string} code - 6-digit verification code
 */
const sendVerificationSMS = async (phoneNumber, code) => {
  try {
    // For development: Just log the code
    console.log("=".repeat(60));
    console.log("📱 SMS VERIFICATION CODE");
    console.log("=".repeat(60));
    console.log(`Phone: ${phoneNumber}`);
    console.log(`Code:  ${code}`);
    console.log(`Time:  ${new Date().toLocaleString()}`);
    console.log("=".repeat(60));
    console.log("✅ In production, this would be sent via SMS");
    console.log("=".repeat(60));
    
    // TODO: Integrate with SMS provider
    // Example with Twilio:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: `Mã xác thực Zalo Clone của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    */
    
    return true;
  } catch (error) {
    console.error("❌ Error sending SMS:", error);
    throw error;
  }
};

/**
 * Generates a 6-digit verification code
 * @returns {string} 6-digit code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { 
  sendVerificationSMS,
  generateVerificationCode
};
