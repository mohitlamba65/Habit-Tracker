import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { PlusCircleIcon } from 'lucide-react';
import { FiCheckCircle } from 'react-icons/fi';

const HabitCard = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState({ title: '', description: '' });

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await axios.get('/api/habits');
        setHabits(res.data);
      } catch (error) {
        console.error('Error fetching habits:', error);
      }
    };
    fetchHabits();
  }, []);

  const handleAddHabit = async () => {
    if (!newHabit.title || !newHabit.description) return;

    try {
      const res = await axios.post('/api/habits', {
        habit: newHabit.title,
        description: newHabit.description,
        status: false,
        completion_time: new Date().toISOString()
      });

      setHabits([...habits, res.data]);
      setNewHabit({ title: '', description: '' });
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  return (
    <>
      {habits.map((habit) => (
        <motion.div
          key={habit._id}
          className="bg-white p-5 rounded-lg shadow-lg border border-gray-200 flex flex-col items-center text-center"
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <FiCheckCircle size={36} className="text-blue-600 mb-3" />
          <h3 className="text-xl font-semibold mb-2 capitalize">{habit.habit}</h3>
          <p className="text-gray-600 mb-4">{habit.description || "No description provided."}</p>
          <button className="text-blue-500 hover:underline">View Details</button>
        </motion.div>
      ))}

      <motion.div
        className="bg-gray-100 p-5 rounded-lg shadow-lg flex flex-col items-center text-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <PlusCircleIcon size={36} className="text-green-600 mb-3" />
        <h3 className="text-xl font-semibold mb-2">Add New Habit</h3>
        <input
          type="text"
          placeholder="Habit Title"
          className="w-full p-2 border border-gray-300 rounded mb-2"
          value={newHabit.title}
          onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Habit Description"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={newHabit.description}
          onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
        />
        <button
          onClick={handleAddHabit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition transform hover:scale-105"
        >
          Add Habit
        </button>
      </motion.div>
    </>
  );
};

export default HabitCard;
