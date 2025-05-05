if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then(dotenv => dotenv.config());
}


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
console.log("CORS Origin:", process.env.CORS_ORIGIN);
app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials:true
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