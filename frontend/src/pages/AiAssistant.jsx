import { useEffect, useRef, useState } from "react";
import { sendChatToGroq } from "../api/chatGroq.js";
import { extractFileText } from "../utils/extractFileText.js";
import { Send, Bot, LoaderCircle, FileText, Mic, MicOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const AiAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();


  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleListening = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Browser doesn't support voice input.");
      return;
    }
  
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      toast("Stopped Listening.");
    } else {
      setIsListening(true);
      SpeechRecognition.startListening({ continuous: false });
      toast("Listening...");
    }
  };
  
  
  useEffect(() => {
    if (!listening && transcript.trim() !== "") {
      sendMessage(transcript);
      resetTranscript();
      setIsListening(false); 
    }
  }, [listening, transcript, resetTranscript]);
  

  const sendMessage = async (text) => {
    const cleanedText = text.trim();
    if (!cleanedText) return;
  
    const newMessages = [...messages, { sender: "user", text: cleanedText }];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);
    setStatus("Thinking...");
  
    try {
      const aiResponse = await sendChatToGroq(newMessages);
      const aiMessage = { sender: "ai", text: aiResponse };
      setMessages([...newMessages, aiMessage]);
      setStatus("Ready");
    } catch (error) {
      toast.error("AI failed to respond.");
      setMessages([...newMessages, { sender: "ai", text: "Error: AI not responding." }]);
      setStatus("Error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["text/plain", "application/pdf"].includes(file.type)) {
      toast.error("Only PDF and TXT files are supported.");
      return;
    }

    const maxFileSize = 200 * 1024;
    if (file.size > maxFileSize) {
      toast.error("File too large! Limit ~100KB");
      return;
    }

    try {
      setStatus("Extracting file content...");
      const content = await extractFileText(file);
      const preview =
        content.slice(0, 500) + (content.length > 500 ? "..." : "");
      setMessages([...messages, { sender: "user", text: preview }]);
      await sendMessage(`Here is the content of the file:\n\n${content}`);
    } catch (err) {
      toast.error("Failed to read the file.");
      setMessages([ 
        ...messages, 
        { sender: "ai", text: "Error reading file content." } 
      ]);
      console.error("File read error:", err);
      setStatus("Error");
    }
  };

  return (
    <div className="flex flex-col items-center pt-[4.5rem] min-h-screen justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          <Bot className="w-6 h-6" />
          Groq AI Assistant
        </h1>

        <p
          className={`text-center text-sm font-semibold mb-2 ${status === "Ready" ? "text-green-600" : status === "Thinking..." ? "text-yellow-500" : "text-red-500"}`}
        >
          {status}
        </p>

        <div className="chat-box h-80 overflow-y-auto  p-4 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg mb-2 max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white ml-auto"
                    : "bg-gray-200 dark:bg-gray-600 text-black dark:text-white"
                }`}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 dark:text-gray-300"
            >
              AI is typing<span className="animate-pulse">...</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 mt-5"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(message)}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg placeholder-gray-500 outline-none"
            />
            <button
              onClick={toggleListening}
              className={`p-2 rounded-full transition-all duration-200 ${
                isListening
                  ? "bg-green-500 text-white animate-pulse"
                  : "bg-red-500 text-white"
              }`}
            >
              {isListening ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => sendMessage(message)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-500 transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>

          <motion.label
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-3 px-4 py-3 cursor-pointer bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition duration-300"
          >
            <FileText className="w-5 h-5" />
            Upload File (.txt or .pdf)
            <input
              type="file"
              accept=".pdf, .txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </motion.label>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AiAssistant;
