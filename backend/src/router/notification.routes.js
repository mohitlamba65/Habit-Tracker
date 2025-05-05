import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  updateNotificationPrefs,
  markAllAsRead
} from "../controllers/notification.controller.js";

const router = express.Router();

// Get all notifications for the authenticated user
router.get("/", isAuthenticated, getNotifications);

// Mark a specific notification as read
router.patch("/:id/read", isAuthenticated, markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", isAuthenticated, markAllAsRead);

// Update notification preferences
router.patch("/preferences", isAuthenticated, updateNotificationPrefs);

export default router;