import { Prediction } from "../models/prediction.model.js";
import { Productivity } from "../models/productivity.model.js"

const analyzeTimestamps = (logs) => {
  const hours = Array(24).fill(0);
  logs.forEach((log) => {
    const hour = new Date(log.createdAt).getHours();
    hours[hour]++;
  });
  const max = Math.max(...hours);
  const peak = hours.map((v, i) => (v === max ? i : null)).filter((x) => x !== null);
  return peak;
};

export const generatePrediction = async (req, res) => {
  try {
    const logs = await Productivity.find({ user: req.user._id });
    const peakHours = analyzeTimestamps(logs);

    const prediction = await Prediction.create({
      user: req.user._id,
      peak_productivity_times: peakHours.map((h) => `${h}:00`)
    });

    res.status(201).json(prediction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ user: req.user._id });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
