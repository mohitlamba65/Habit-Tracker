import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import MainContext from "../context/MainContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TaskModal from "../components/TaskModal";

import { getTasks, completeTask, deleteTask } from "../api/taskApi";

const Dashboard = () => {
  const { tasks, setTasks } = useContext(MainContext);
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState("name");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (err) {
        toast.error("Failed to load tasks.");
        console.error(err);
      }
    };
    fetchData();
  }, [setTasks]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.status;
    if (filter === "pending") return !task.status;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortKey === "name") return a.habit.localeCompare(b.habit);
    if (sortKey === "time") return new Date(a.completion_time) - new Date(b.completion_time);
    return 0;
  });

  const handleComplete = async (id) => {
    try {
      await completeTask(id);
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? { ...task, status: true } : task))
      );
      toast.success("Task marked as complete!");
    } catch (err) {
      toast.error("Failed to complete task.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      toast.success("Task deleted!");
    } catch (err) {
      toast.error("Failed to delete task.");
    }
  };

  const completedCount = tasks.filter((t) => t.status).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <Sidebar />
      <div className="flex-1 ml-64 px-10 py-6">
        <Header />

        <motion.h2
          className="text-4xl font-bold text-center text-[#6348EB] mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Your Dashboard
        </motion.h2>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-[#6348EB] via-[#8B36EA] to-[#2F5FEB]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <TaskModal />
          <select
            className="p-2 border rounded-md text-sm shadow-sm"
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          <select
            className="p-2 border rounded-md text-sm shadow-sm"
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="time">Sort by Deadline</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <motion.div
                key={task._id}
                className={`p-5 rounded-lg shadow-md border transition-all ${
                  task.status ? "bg-green-50 border-green-400" : "bg-white border-gray-200"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-xl font-semibold text-gray-800">{task.habit}</h2>
                <p className="text-gray-500 text-sm">
                  Due: {new Date(task.completion_time).toLocaleString()}
                </p>
                <div className="mt-3 flex gap-2">
                  {!task.status && (
                    <button
                      className="bg-gradient-to-r from-[#6348EB] via-[#8B36EA] to-[#2F5FEB] text-white px-3 py-1.5 rounded-md text-sm"
                      onClick={() => handleComplete(task._id)}
                    >
                      ✅ Complete
                    </button>
                  )}
                  <button
                    className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm"
                    onClick={() => handleDelete(task._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500">No tasks available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
