import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  createHabit,
  deleteHabit,
  getHabitLogs,
  getUserHabits,
  markHabitComplete,
  missedHabits,
  updateHabitPriority
} from "../controllers/habit.controller.js";

const router = express.Router();

router.post("/createHabit", isAuthenticated, createHabit);
router.get("/getHabits", isAuthenticated, getUserHabits);
router.patch("/:habitId/complete", isAuthenticated, markHabitComplete);
router.patch("/:habitId/priority", isAuthenticated, updateHabitPriority);
router.delete("/:habitId", isAuthenticated, deleteHabit);
router.post("/missed-check", isAuthenticated,missedHabits)
router.get("/getHabitLogs", isAuthenticated, getHabitLogs);

export default router;