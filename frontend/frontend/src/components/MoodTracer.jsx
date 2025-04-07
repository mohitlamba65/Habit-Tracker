import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSmile, FiFrown, FiMeh, FiCloudDrizzle } from 'react-icons/fi';

const MoodTracker = () => {
  const [mood, setMood] = useState('neutral');

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Track Your Mood</h2>
      <div className="flex justify-center space-x-4 mb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMood('happy')}
          className={`p-4 rounded-full ${mood === 'happy' ? 'bg-yellow-300' : 'bg-gray-200'}`}
        >
          <FiSmile size={32} className="text-yellow-600" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMood('sad')}
          className={`p-4 rounded-full ${mood === 'sad' ? 'bg-blue-300' : 'bg-gray-200'}`}
        >
          <FiFrown size={32} className="text-blue-600" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMood('neutral')}
          className={`p-4 rounded-full ${mood === 'neutral' ? 'bg-gray-300' : 'bg-gray-200'}`}
        >
          <FiMeh size={32} className="text-gray-600" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMood('rainy')}
          className={`p-4 rounded-full ${mood === 'rainy' ? 'bg-gray-400' : 'bg-gray-200'}`}
        >
          <FiCloudDrizzle size={32} className="text-gray-700" />
        </motion.button>
      </div>
      <p className="text-center text-gray-600">Current Mood: <strong>{mood}</strong></p>
    </div>
  );
};

export default MoodTracker;
