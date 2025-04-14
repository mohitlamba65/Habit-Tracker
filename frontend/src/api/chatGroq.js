import axios from "axios";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const sendChatToGroq = async (messageHistory) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          ...messageHistory.map((msg) => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text,
          })),
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    throw new Error("Groq API failed");
  }
};
