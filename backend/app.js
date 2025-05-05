import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import userRoutes from "./src/router/user.routes.js"
import habitRoutes from "./src/router/habit.routes.js"
import productivityRoutes from "./src/router/productivity.routes.js"
import predictionRoutes from "./src/router/prediction.routes.js"
import notificationRoutes from "./src/router/notification.routes.js";
import { agenda } from "./src/services/scheduler.service.js"
import agenda2 from "./src/services/agenda.js"
import regeneratePrediction from "./src/jobs/regeneratePrediction.js"

regeneratePrediction(agenda2);

await agenda.start();

// Run every week (Sunday at 2am)
await agenda.every('0 2 * * 0', 'regenerate prediction');  // Using cron format

const app = express()

// Define allowed origins - make sure these URLs are exact matches without trailing slashes
const allowedOrigins = [
  'http://localhost:5173',
  'https://habit-tracker-chi-eight.vercel.app',
  'https://habit-tracker-css7d1ibd-mohits-projects-c3a090b0.vercel.app'
];

console.log("Allowed CORS Origins:", allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      return callback(null, true);
    }
  },
  credentials: true
}))

agenda.start().then(() => {
  console.log('✅ Agenda started');
});
  
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/users", userRoutes)
app.use("/api/habits", habitRoutes)
app.use("/api/productivity", productivityRoutes);
app.use("/api/predictions", predictionRoutes)
app.use("/api/notifications", notificationRoutes);

export {app}