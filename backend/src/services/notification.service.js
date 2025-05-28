import twilio from "twilio"; 
import nodemailer from "nodemailer";

// Create reusable email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Add timeout handling
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100
});

// Test email configuration on startup
(async () => {
  try {
    await transporter.verify();
    console.log('Email transporter is ready');
  } catch (err) {
    console.error('Email configuration error:', err);
  }
})();

/**
 * Send email notification to a user
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 * @returns {Promise} - Email send result
 */
export const sendEmailNotification = async (to, subject, text) => {
  const mailOptions = {
    from: `"Habit Tracker" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to} (${result.messageId})`);
    return result;
  } catch (err) {
    console.error("Email sending failed:", err);
    throw err; // Rethrow for handling by caller
  }
};

// Initialize Twilio client with error handling
let twilioClient = null;
try {
  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_AUTH;
  
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio client initialized');
  } else {
    console.warn('Twilio credentials missing, WhatsApp notifications disabled');
  }
} catch (err) {
  console.error('Failed to initialize Twilio client:', err);
}

/**
 * Send WhatsApp notification to a user
 * @param {string} to - Recipient phone number (with country code)
 * @param {string} message - Message content
 * @returns {Promise} - WhatsApp send result
 */
export const sendWhatsAppNotification = async (to, message) => {
  if (!twilioClient) {
    throw new Error('Twilio client not initialized');
  }
  
  try {
    return await twilioClient.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${to}`,
      body: message
    });
  } catch (err) {
    console.error(`WhatsApp message to ${to} failed:`, err);
    throw err; 
  }
};