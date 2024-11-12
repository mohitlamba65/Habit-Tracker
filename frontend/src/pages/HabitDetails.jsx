import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import habitData from '../../../backend/data/habits.json';

const HabitDetails = () => {
  const { id } = useParams();
  const habit = habitData.habits.find((habit) => habit.id === parseInt(id));

  if (!habit) return <div className="text-center text-white">Habit not found</div>;

  return (
    <motion.div
      className="container mx-auto p-10 bg-white shadow-lg rounded-lg max-w-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-4xl font-bold text-center text-blue-600">{habit.title}</h2>
      <p className="text-gray-600 text-center my-6">{habit.description}</p>
      <div className="text-center">
        <p className="mb-4">Track your progress and motivation levels here.</p>
        <button className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600">
          Start Tracking
        </button>
      </div>
    </motion.div>
  );
};

export default HabitDetails;
