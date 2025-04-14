import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/habits",
  withCredentials: true,
});

export const getTasks = async () => {
  const res = await API.get("/getHabits");
  return res.data;
};

export const addTask = async (task) => {
  const res = await API.post("/createHabit", {
    habit: task.habit,
    completion_time: task.completion_time,
  });
  return res.data;
};

export const completeTask = async (taskId) => {
  const res = await API.patch(`/${taskId}/complete`);
  return res.data;
};

export const deleteTask = async (taskId) => {
  const res = await API.delete(`/${taskId}`);
  return res.data;
};
