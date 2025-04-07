import { useState } from "react";
import ollama from "ollama";

const AiAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");

 
  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessages = [...messages, { sender: "user", text: message }];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);
    setStatus("Thinking...");

    try {
      const response = await ollama.chat({
        model: "mistral", 
        messages: [{ role: "user", content: message }],
      });

      const aiMessage = { sender: "ai", text: response.message.content };
      setMessages([...newMessages, aiMessage]);
      setStatus("Ready");
    } catch (error) {
      setMessages([...newMessages, { sender: "ai", text: "Error: AI not responding." }]);
      setStatus("Error");
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Ollama AI Assistant
        </h1>
        <p className={`text-center text-sm font-semibold ${status === "Ready" ? "text-green-600" : "text-red-500"}`}>
          {status}
        </p>


        <div className="chat-box h-80 overflow-y-auto p-4 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[75%] ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white ml-auto"
                  : "bg-gray-200 my-10 dark:bg-gray-600 text-black dark:text-white"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg placeholder-gray-500 outline-none"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-500 transition-all duration-200"
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
