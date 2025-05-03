import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  sendReminderEmail,
  updateNotificationPrefs,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getNotifications);
router.patch("/:id/read", isAuthenticated, markAsRead);
router.patch("/preferences", isAuthenticated, updateNotificationPrefs);
router.post("/send-reminder",isAuthenticated,sendReminderEmail)

export default router;
