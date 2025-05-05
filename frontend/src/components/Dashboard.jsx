import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import MainContext from "../context/MainContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TaskModal from "../components/TaskModal";
import API from "../utils/axios";
import {
  getTasks,
  completeTask,
  deleteTask,
  updateTaskPriority,
} from "../api/taskApi.js";
import axios from "axios";

const Dashboard = () => {
  const { tasks, setTasks } = useContext(MainContext);
  const [filter, setFilter] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [mood, setMood] = useState(null);
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [productivityLogs, setProductivityLogs] = useState([]);

  const { habitCreatedTrigger } = useContext(MainContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitsRes, moodLogsRes] = await Promise.all([
          getTasks(),
          API.get("/productivity"),
        ]);

        setTasks(habitsRes);

        const logs = moodLogsRes.data;
        const logsRes = await API.get("/habits/getHabitlogs");
        const pLogs = logsRes.data;
        
        const formattedLogs = pLogs.map(log => ({
          start_hour: new Date(log.start_time).getHours(),
          mood: log.mood_code ?? 1, 
          duration: log.completion_time
            ? (new Date(log.completion_time) - new Date(log.start_time)) / (1000 * 60) 
            : 0
        }));
        
        setProductivityLogs(formattedLogs);
        
        if (logs.length > 0) {
          const lastMood = logs.at(-1).mood;
          
          setMood(lastMood);
          suggestTasks(lastMood, habitsRes);
        }
      } catch (err) {
        toast.error("Failed to load dashboard data.");
        console.error(err);
      }
    };
    fetchData();
  }, [setTasks]);

  const fetchProductiveTimes = async (logs) => {
    try {
      console.log("Sending logs to ML service:", logs);
      const res = await axios.post("http://127.0.0.1:5001/predict", { logs });
      console.log("ML service response:", res.data);
      
      // Check if we got valid predicted times from ML service
      if (res.data && res.data.predicted_times && res.data.predicted_times.length > 0) {
        return res.data.predicted_times;
      } else {
        throw new Error("No valid prediction from ML service");
      }
    } catch (mlError) {
      console.error("ML service error:", mlError);
      
      try {
        console.log("Using fallback API");
        const fallback = await API.post("/predictions/generate");
        console.log("Fallback API response:", fallback.data);
        
        // Extract peak_productivity_times from the response
        if (fallback.data && fallback.data.peak_productivity_times) {
          return fallback.data.peak_productivity_times;
        } else {
          return [];
        }
      } catch (fallbackError) {
        console.error("Fallback API error:", fallbackError);
        toast.error("Failed to fetch productive times.");
        return [];
      }
    }
  };
  

  useEffect(() => {
    const showPredictedTimes = async () => {
      if (!habitCreatedTrigger || productivityLogs.length === 0) return;
  
      const times = await fetchProductiveTimes(productivityLogs);
      if (times.length > 0) {
        toast.success(`Predicted productive times: ${times.join(", ")}`, {
          duration: 6000,
        });
  
        toast(
          (t) => (
            <span>
              Try aligning this habit with <b>{times[0]}</b> for better consistency.
              <button
                onClick={() => toast.dismiss(t.id)}
                className="ml-4 bg-purple-500 text-white px-2 py-1 rounded"
              >
                Got it!
              </button>
            </span>
          ),
          { duration: 8000 }
        );
      }
    };
  
    showPredictedTimes();
  }, [habitCreatedTrigger, productivityLogs]);
  
  
  const suggestTasks = (userMood, allTasks) => {
    let filtered = [];

    if (userMood === "happy") {
      filtered = allTasks.filter((task) => task.priority === "high");
    } else if (userMood === "neutral") {
      filtered = allTasks.filter((task) => task.priority === "medium");
    } else if (userMood === "sad" || userMood === "stressed") {
      filtered = allTasks.filter((task) => task.priority === "low");
    } else {
      filtered = allTasks;
    }

    setSuggestedTasks(filtered);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.status === "completed";
    if (filter === "pending") return task.status === "pending";
    if (filter === "missed") return task.status === "missed";
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Prioritize missed tasks first
    const statusPriority = { missed: 0, pending: 1, completed: 2 };
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }

    if (sortKey === "name") return a.habit.localeCompare(b.habit);
    if (sortKey === "time")
      return new Date(a.completion_time) - new Date(b.completion_time);
    if (sortKey === "priority")
      return (a.priority || "medium").localeCompare(b.priority || "medium");
    return 0;
  });

  const handleComplete = async (id) => {
    try {
      await completeTask(id);
      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? { ...task, status: "completed" } : task
        )
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
      toast.error("Failed to delete task.", err);
    }
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;
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
            <span className="text-sm font-medium text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-[#6348EB] via-[#8B36EA] to-[#2F5FEB]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </motion.div>

        {mood && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Mood: <span className="capitalize">{mood}</span>
            </h3>
            <h4 className="text-lg font-semibold text-gray-700 mb-3">
              Suggested Tasks for you:
            </h4>

            {suggestedTasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sortedTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-4 border rounded-lg ${
                      task.status === "missed"
                        ? "bg-red-50 border-red-400"
                        : task.status === "completed"
                        ? "bg-green-50 border-green-400"
                        : "bg-yellow-50 border-yellow-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold text-gray-800">
                        {task.habit}
                      </h2>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          task.status === "missed"
                            ? "bg-red-200 text-red-800"
                            : task.status === "completed"
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Due: {new Date(task.completion_time).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No special suggestions right now.</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <TaskModal />
          <select
            className="p-2 border rounded-md text-sm shadow-sm"
            onChange={(e) => setSortKey(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="time">Sort by Deadline</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => (
              <motion.div
                key={task._id}
                className={`p-5 rounded-lg shadow-md border transition-all ${
                  task.status=="completed"
                    ? "bg-green-50 border-green-400"
                    : "bg-white border-gray-200"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {task.habit}
                </h2>
                <p className="text-gray-500 text-sm">
                  Due: {new Date(task.completion_time).toLocaleString()}
                </p>

                <div className="mt-2">
                  <label className="text-sm font-medium text-gray-600 mr-2">
                    Priority:
                  </label>
                  <select
                    value={task.priority || "medium"}
                    onChange={async (e) => {
                      const newPriority = e.target.value;
                      try {
                        await updateTaskPriority(task._id, newPriority);
                        setTasks((prev) =>
                          prev.map((t) =>
                            t._id === task._id
                              ? { ...t, priority: newPriority }
                              : t
                          )
                        );
                        toast.success("Priority updated!");
                      } catch (err) {
                        toast.error("Failed to update priority");
                        console.error(err);
                      }
                    }}
                    className="p-1 border rounded-md text-sm bg-gray-100"
                  >
                    <option value="high">High 🔥</option>
                    <option value="medium">Medium 🟡</option>
                    <option value="low">Low 🧊</option>
                  </select>
                </div>

                <div className="mt-3 flex gap-2">
                  {task.status=="pending" && (
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
