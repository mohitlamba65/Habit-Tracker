import express from "express";
import {
  savePrediction,
  getUserPredictions
} from "../controllers/prediction.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, savePrediction);
router.get("/", isAuthenticated, getUserPredictions);

export default router;
