import { useContext, useState } from "react";
import MainContext from "../context/MainContext";

const Tasks = () => {
  const { tasks, setTasks } = useContext(MainContext);
  const [activeTab, setActiveTab] = useState("active");

  const addTask = () => {
    const taskTitle = prompt("Enter Task Title:");
    if (taskTitle) {
      setTasks([...tasks, { id: Date.now(), title: taskTitle, completed: false, priority: "medium" }]);
    }
  };

  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  };

  const filterTasks = (type) => {
    switch (type) {
      case "active":
        return tasks.filter((task) => !task.completed);
      case "completed":
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-700 p-6 text-white py-28">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 text-gray-900">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">📋 My Tasks</h2>
          <button onClick={addTask} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            + Add Task
          </button>
        </div>

        <div className="flex space-x-4 mt-4 border-b">
          {["active", "completed", "all"].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 ${
                activeTab === tab ? "border-b-4 border-indigo-600 text-indigo-600 font-semibold" : "text-gray-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-4">
          {filterTasks(activeTab).map((task) => (
            <div key={task.id} className="flex justify-between items-center p-4 border rounded-md bg-gray-100">
              <span className={`${task.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                {task.title}
              </span>
              <button
                onClick={() => toggleTaskCompletion(task.id)}
                className={`px-3 py-1 text-sm font-semibold rounded ${
                  task.completed ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}
              >
                {task.completed ? "Undo" : "Complete"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;


