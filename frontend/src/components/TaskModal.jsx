import { useState } from "react";
import PropTypes from "prop-types"; 

const TaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    subject: "",
  });

  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...task, id: Date.now(), completed: false }); 
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h3 className="text-xl font-semibold mb-4">Add New Task</h3>
        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Task Title"
            className="w-full mb-2 p-2 border"
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            className="w-full mb-2 p-2 border"
            onChange={handleChange}
          ></textarea>
          <input
            type="date"
            name="dueDate"
            className="w-full mb-2 p-2 border"
            onChange={handleChange}
          />
          <select
            name="priority"
            className="w-full mb-2 p-2 border"
            onChange={handleChange}
            defaultValue="medium"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full rounded"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TaskModal;
