import dotenv from "dotenv"
dotenv.config()

import { app } from "./app.js";
import connectDB from "./src/db/index.js";


const port = process.env.PORT

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERR: ", error)
            throw error
        })
        app.listen(port, () => {
            console.log("⚙ Server is running at Port: ", port)
        })
    })
    .catch((err) => {
        console.log("MongoDB connection failed!!", err)
    })