import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  createHabit,
  deleteHabit,
  getUserHabits,
  markHabitComplete,
  updateHabitPriority
} from "../controllers/habit.controller.js";

const router = express.Router();

router.post("/createHabit", isAuthenticated, createHabit);
router.get("/getHabits", isAuthenticated, getUserHabits);
router.patch("/:habitId/complete", isAuthenticated, markHabitComplete);
router.patch("/:habitId/priority", isAuthenticated, updateHabitPriority);
router.delete("/:habitId", isAuthenticated, deleteHabit);

export default router;