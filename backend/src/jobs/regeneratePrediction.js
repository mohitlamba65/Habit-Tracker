//jobs/regeneratePrediction.js
import { Productivity } from "../models/productivity.model.js";
import { Prediction } from "../models/prediction.model.js";
import { getProductivityPrediction } from "../utils/mlService.js";
import { analyzeTimestamps } from "../controllers/prediction.controller.js"; 

export default function (agenda) {
  agenda.define("regenerate prediction", async (job) => {
    try {
      console.log("Running scheduled prediction regeneration...");

      const userIds = await Productivity.distinct("user");

      for (const userId of userIds) {
        const logs = await Productivity.find({ user: userId });

        let peakHours = await getProductivityPrediction(userId, logs);
        if (!peakHours || peakHours.length === 0) {
          peakHours = analyzeTimestamps(logs);
        }

        await Prediction.create({
          user: userId,
          peak_productivity_times: peakHours.map((h) => `${h}:00`)
        });

        console.log(`Prediction generated for user ${userId}`);
      }
    } catch (err) {
      console.error("Agenda job error:", err.message);
    }
  });
}
