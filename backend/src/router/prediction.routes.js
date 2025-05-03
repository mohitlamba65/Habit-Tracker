import express from "express";
import {
  generatePrediction,
  getUserPredictions
} from "../controllers/prediction.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", isAuthenticated, generatePrediction);
router.get("/", isAuthenticated, getUserPredictions);

export default router;
