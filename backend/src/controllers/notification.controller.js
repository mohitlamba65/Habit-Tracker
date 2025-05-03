import { Notification } from "../models/notification.model.js";
import { sendEmail } from "../utils/sendReminder.js";
import { Habit } from "../models/habit.model.js";
import { sendWhatsApp } from "../utils/sendWhatsapp.js";

export const getNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    const notifications = await Notification.find({ user: req.user._id }).sort({ timestamp: -1 });
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(
    req.params.id,
    {
      isRead: true
    }
  );
  res.status(200).json({ message: "Marked as read" });
};

export const updateNotificationPrefs = async (req, res) => {
  const user = req.user;
  const settings = req.body;

  user.notificationSettings = {
    ...user.notificationSettings,
    ...settings
  };

  await user.save();
  res.status(200).json({ updated: user.notificationSettings });
};



export const sendReminderEmail = async (req, res) => {
  const { email, name } = req.user;

  try {

    const habits = await Habit.find({
      owner: req.user?._id,
      status: false
    })

    if (!habits.length) {
      return res.status(200).json({ message: "No pending tasks for today" })
    }

    const taskList = habits.map((h, i) => `${i + 1}. ${h.habit} (Due: ${h.completion_time})`).join("\n")

    await sendEmail(
      email,
      "⏰ Habit Reminder",
      `Hey ${name || "there"}, \n\nHere are your pending tasks for today:\n\n${taskList}\n\nComplete them and boost your productivity! ✅`
    );

    await Notification.create({
      user: req.user._id,
      message: "Reminder email sent!",
    });


    res.status(200).json({ message: "Reminder email sent successfully!" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Failed to send reminder email." });
  }
};

export const sendWhatsAppReminder = async (req, res) => {
  const { phone, name } = req.user;
  const habits = await Habit.find({ owner: req.user._id, status: false });

  const list = habits.map((h, i) => `${i + 1}. ${h.habit}`).join("\n");

  await sendWhatsApp(phone, `Hi ${name},\nDon't forget your habits:\n${list}`);
  await Notification.create({
    user: req.user._id,
    message: "WhatsApp habit reminder sent!",
  });


  res.status(200).json({ message: "WhatsApp reminder sent" });

};

