import { Notification } from "../models/notification.model.js";


export const getNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .lean(); // Using lean() for better performance

    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    });

    console.log(`Found ${notifications.length} notifications, ${unreadCount} unread`);

    res.status(200).json({ 
      notifications, 
      unreadCount,
      success: true
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ 
      message: "Server error while fetching notifications", 
      success: false 
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID is required" });
    }
    
    await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true } 
    );
    
    res.status(200).json({ message: "Marked as read", success: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateNotificationPrefs = async (req, res) => {
  try {
    const user = req.user;
    const settings = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    user.notificationSettings = {
      ...user.notificationSettings,
      ...settings
    };

    await user.save();
    
    res.status(200).json({ 
      updated: user.notificationSettings,
      success: true 
    });
  } catch (err) {
    console.error("Error updating notification preferences:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Create a notification for a user
export const createNotification = async (userId, message) => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      isRead: false
    });
    
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    throw err;
  }
};

// Helper function to mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.status(200).json({ message: "All notifications marked as read", success: true });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
};