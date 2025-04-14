import { Prediction } from "../models/prediction.model.js";

export const savePrediction = async (req, res) => {
    try {
      const { peak_productivity_times } = req.body;
  
      const prediction = await Prediction.create({
        user: req.user._id,
        peak_productivity_times
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