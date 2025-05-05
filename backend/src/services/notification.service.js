import twilio from "twilio";
import nodemailer from "nodemailer"


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmailNotification = async (to, subject, text) => {
  const mailOptions = {
    from: `"Habit Tracker" <${process.env.EMAIL}>`,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending failed:", err);
  }
};



const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const client = twilio(accountSid, authToken);



export const sendWhatsAppNotification = async (to, message) => {
  return await client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:${to}`,
    body: message
  });
};

