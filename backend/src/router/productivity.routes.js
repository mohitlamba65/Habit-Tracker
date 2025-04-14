import express from "express";
import {
  logProductivity,
  getUserProductivityLogs
} from "../controllers/productivity.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, logProductivity);
router.get("/", isAuthenticated, getUserProductivityLogs);

export default router;
