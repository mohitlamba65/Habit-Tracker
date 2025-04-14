import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import userRoutes from "./src/router/user.routes.js"
import habitRoutes from "./src/router/habit.routes.js"
import productivityRoutes from "./src/router/productivity.routes.js"
import predictionRoutes from "./src/router/prediction.routes.js"

const app = express()
console.log("CORS Origin:", process.env.CORS_ORIGIN);
app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/users", userRoutes)
app.use("/api/habits", habitRoutes)
app.use("/api/productivity", productivityRoutes);
app.use("/api/predictions", predictionRoutes)

export {app}