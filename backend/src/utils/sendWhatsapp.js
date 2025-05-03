import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendWhatsApp = async (to, message) => {
  return await client.messages.create({
    from: "whatsapp:+14155238886", 
    to: `whatsapp:${to}`,
    body: message
  });
};
