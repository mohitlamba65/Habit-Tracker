import { Prediction } from "../models/prediction.model.js";
import { Productivity } from "../models/productivity.model.js"
import { getProductivityPrediction } from "../utils/mlService.js";

export const analyzeTimestamps = (logs) => {
  // Initialize array to count occurrences for each hour (0-23)
  const hours = Array(24).fill(0);

  logs.forEach((log) => {
    if (log && log.createdAt) {
      try {
        const hour = new Date(log.createdAt).getHours();
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hours[hour]++;
        }
      } catch (error) {
        console.error("Error parsing timestamp:", error);
      }
    }
  });

  // Find the maximum count
  const max = Math.max(...hours);

  // If all hours have count 0, return default hours
  if (max === 0) {
    return [9, 14, 19]; // Default productivity hours (morning, afternoon, evening)
  }

  // Find all hours that have the maximum count
  const peakHours = hours.map((count, hour) => (count === max ? hour : null))
    .filter(hour => hour !== null);

  console.log("Peak hours based on timestamp analysis:", peakHours);

  return peakHours;
};

export const generatePrediction = async (req, res) => {
  try {
    const logs = await Productivity.find({ user: req.user._id });

    let peakHours = await getProductivityPrediction(req.user._id, logs);

    // Fallback if ML API failed or returned empty
    if (!peakHours || peakHours.length === 0) {
      console.warn("Falling back to timestamp analysis");
      peakHours = analyzeTimestamps(logs);
    }

    const prediction = await Prediction.create({
      user: req.user._id,
      peak_productivity_times: peakHours.map((h) => `${h}:00`)
    });

    res.status(201).json(prediction);
  } catch (err) {
    console.error("Prediction error:", err.message);
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
