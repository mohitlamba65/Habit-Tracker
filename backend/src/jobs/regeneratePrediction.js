import { Productivity } from "../models/productivity.model.js";
import { Prediction } from "../models/prediction.model.js";
import { getProductivityPrediction } from "../utils/mlService.js";
import { analyzeTimestamps } from "../controllers/prediction.controller.js"; 

export default function (agenda) {
  agenda.define("regenerate prediction", async (job) => {
    try {
      console.log("Running scheduled prediction regeneration...");

      // Get unique user IDs from productivity logs
      const userIds = await Productivity.distinct("user");
      console.log(`Found ${userIds.length} users for prediction regeneration`);

      for (const userId of userIds) {
        try {
          // Fetch productivity logs for this user
          const logs = await Productivity.find({ user: userId });
          
          if (!logs || logs.length === 0) {
            console.log(`No productivity logs found for user ${userId}, skipping`);
            continue;
          }

          // Get productivity prediction, with fallback to timestamp analysis
          let peakHours = [];
          try {
            peakHours = await getProductivityPrediction(userId, logs);
          } catch (predictionErr) {
            console.error(`ML prediction failed for user ${userId}:`, predictionErr.message);
          }

          // Use fallback if ML prediction failed or returned empty
          if (!peakHours || peakHours.length === 0) {
            console.log(`Using timestamp analysis fallback for user ${userId}`);
            peakHours = analyzeTimestamps(logs);
          }

          // Create or update prediction
          if (peakHours && peakHours.length > 0) {
            await Prediction.findOneAndUpdate(
              { user: userId },
              { 
                user: userId,
                peak_productivity_times: peakHours.map((h) => `${h}:00`),
                generated_at: new Date()
              },
              { upsert: true, new: true }
            );
            console.log(`Prediction generated for user ${userId}`);
          } else {
            console.log(`Could not generate prediction for user ${userId}`);
          }
        } catch (userErr) {
          console.error(`Error processing predictions for user ${userId}:`, userErr.message);
          // Continue with next user
        }
      }
    } catch (err) {
      console.error("Agenda job error:", err);
    }
  });

  console.log("Regenerate prediction job defined");
}