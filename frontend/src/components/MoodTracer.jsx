import { useState } from "react";
import { motion } from "framer-motion";
import { FiSmile, FiFrown, FiMeh, FiCloudDrizzle } from "react-icons/fi";
import API from "../utils/axios";
import toast from "react-hot-toast"; 

const MoodTracker = () => {
  const [mood, setMood] = useState("neutral");
  const [activity, setActivity] = useState("");

  const handleMoodChange = async (newMood) => {
    setMood(newMood);

    try {
      await API.post("/productivity", {
        mood: newMood,
        activity_data: activity || "unspecified",
      });

      if (newMood === "happy") {
        toast.success("🎉 You're in a great mood! Let's tackle important tasks!");
      } else if (newMood === "sad" || newMood === "stressed") {
        toast("😔 You seem down! Try a small, easy task to regain momentum.", {
          icon: "🌟",
          duration: 6000,
          style: { background: "#fef2f2", color: "#991b1b" },
        });
      } else {
        toast("🙂 Neutral mood detected. Stay focused and consistent!", {
          icon: "⚡",
          duration: 5000,
          style: { background: "#e0f2fe", color: "#0369a1" },
        });
      }
    } catch (error) {
      console.error("Error logging mood:", error);
      toast.error("Failed to update mood!");
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg mt-[5rem]">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Track Your Mood
      </h2>

      <select
        className="w-full p-2 border border-gray-300 rounded mb-4"
        onChange={(e) => setActivity({ type: e.target.value })}
      >
        <option value="studying">Studying</option>
        <option value="browsing">Browsing</option>
        <option value="gaming">Gaming</option>
      </select>

      <div className="flex justify-center space-x-4 mb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMoodChange("happy")}
          className={`p-4 rounded-full ${mood === "happy" ? "bg-yellow-300" : "bg-gray-200"}`}
        >
          <FiSmile size={32} className="text-yellow-600" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMoodChange("sad")}
          className={`p-4 rounded-full ${mood === "sad" ? "bg-blue-300" : "bg-gray-200"}`}
        >
          <FiFrown size={32} className="text-blue-600" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMoodChange("neutral")}
          className={`p-4 rounded-full ${mood === "neutral" ? "bg-gray-300" : "bg-gray-200"}`}
        >
          <FiMeh size={32} className="text-gray-600" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleMoodChange("rainy")}
          className={`p-4 rounded-full ${mood === "rainy" ? "bg-gray-400" : "bg-gray-200"}`}
        >
          <FiCloudDrizzle size={32} className="text-gray-700" />
        </motion.button>
      </div>

      <p className="text-center text-gray-600">
        Current Mood: <strong>{mood}</strong>
      </p>
    </div>
  );
};

export default MoodTracker;
