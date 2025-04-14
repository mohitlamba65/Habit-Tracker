import { Productivity } from "../models/productivity.model.js";

export const logProductivity = async (req, res) => {
    try {
      const { mood, activity_data } = req.body;
      const entry = await Productivity.create({
        user: req.user.id,
        mood,
        activity_data
      });
  
      res.status(201).json(entry);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};
  
export const getUserProductivityLogs = async (req, res) => {
    try {
      const logs = await Productivity.find({ user: req.user.id });
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  