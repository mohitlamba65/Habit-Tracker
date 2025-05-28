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
import regeneratePrediction from "./src/jobs/regeneratePrediction.js"

// Initialize Express app first
const app = express()

const allowedOrigins = [
    'http://localhost:5173',
];

console.log("Allowed CORS Origins:", allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
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

// Properly configure express middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

// Set up routes
app.use("/api/users", userRoutes)
app.use("/api/habits", habitRoutes)
app.use("/api/productivity", productivityRoutes);
app.use("/api/predictions", predictionRoutes)
app.use("/api/notifications", notificationRoutes);

// Configure Agenda jobs after Express is set up
const setupAgenda = async () => {
    try {
        // Register the prediction regeneration job
        regeneratePrediction(agenda);
        
        // Start agenda once
        await agenda.start();
        console.log('✅ Agenda started');
        
        // Schedule prediction regeneration job (Sunday at 2am)
        await agenda.every('0 2 * * 0', 'regenerate prediction');
    } catch (err) {
        console.error('Failed to start Agenda:', err);
    }
};

// Run agenda setup
setupAgenda();

export { app }