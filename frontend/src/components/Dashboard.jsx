import { useContext, useState } from "react";
import { motion } from "framer-motion";
import MainContext from "../context/MainContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import TaskModal from "../components/TaskModal";

const Dashboard = () => {
  const { tasks, setTasks } = useContext(MainContext);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddTask = (task) => {
    setTasks([...tasks, task]); 
  };

  const handleCompleteTask = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks); 
  };

  

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-20">
      <Sidebar />

      <div className="flex-1 p-6">
        <Header />

        <motion.h2
          className="text-4xl font-bold text-center text-blue-800 mb-6 mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Your Dashboard
        </motion.h2>

        <motion.p
          className="text-center text-gray-700 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Manage your habits, track progress, and plan tasks efficiently.
        </motion.p>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-gray-900">
              Task Manager
            </h3>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              + Add Task
            </button>
          </div>

          <TaskModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleAddTask}
          />

          <div className="mt-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  className={`border p-4 mb-2 rounded shadow-sm ${
                    task.completed ? "bg-green-200" : "bg-gray-100"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="font-bold">{task.title}</h3>
                  <p className="text-gray-700">{task.description}</p>
                  <small className="text-gray-500">Due: {task.dueDate}</small>
                  {!task.completed && (
                    <button
                      className="ml-4 text-sm bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Mark as Complete
                    </button>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No tasks added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
