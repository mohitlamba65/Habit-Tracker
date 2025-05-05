import { Habit } from "../models/habit.model.js";
import { User } from "../models/user.model.js";
import { sendEmailNotification, sendWhatsAppNotification } from "../services/notification.service.js";
import { agenda } from "../services/scheduler.service.js";
import { DateTime } from "luxon";
import { HabitLog } from "../models/habitLogs.model.js";

export const createHabit = async (req, res) => {
  try {
    const { habit, completion_time } = req.body;

    if (!habit || !completion_time) {
      return res.status(400).json({ message: "Habit and completion time are required." });
    }

    // Get current date in IST and merge with time string
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const [hour, minuteStr] = completion_time.split(":");
    const minute = minuteStr.slice(0, 2);
    const period = minuteStr.slice(2).trim().toUpperCase();

    let h = parseInt(hour);
    let m = parseInt(minute);

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    const actualDue = nowIST.set({ hour: h, minute: m, second: 0, millisecond: 0 });

    const newHabit = await Habit.create({
      owner: req.user._id,
      habit,
      completion_time,
      actual_due: actualDue.toJSDate(),
    });

    const hlog = await HabitLog.create({
      habit: newHabit._id,
      date: actualDue.startOf("day").toJSDate(),
      status: "pending"
    });

    console.log(hlog)

    const userEmail = req.user.email;
    const userPhone = req.user.phone;

    const msg = `Hey! You've created a new habit: "${newHabit.habit}"🎉. Stay consistent!`;
    await sendEmailNotification(userEmail, "New Habit Created", msg);
    await sendWhatsAppNotification(userPhone, msg);

    await agenda.start();

    const reminderTime = new Date(actualDue.toMillis() - 60 * 60 * 1000); // 1 hour before
    await agenda.schedule(reminderTime, "habitReminder", {
      habitId: newHabit._id,
      userEmail,
      userPhone,
      name: newHabit.habit,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { habits: newHabit._id }
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error("Error creating habit:", error);
    res.status(500).json({ message: error.message });
  }
};



export const markHabitComplete = async (req, res) => {
  try {
    const { habitId } = req.params;

    const today = DateTime.now().setZone("Asia/Kolkata").startOf("day").toJSDate();
    const log = await HabitLog.findOneAndUpdate(
      { habit: habitId, date: today },
      { status: "completed" },
      { new: true, upsert: true }
    );

    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: habitId, owner: req.user._id },
      { status: "completed" },
      { new: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({ message: "Habit not found or unauthorized", log });
    }

    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteHabit = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findOneAndDelete({
      _id: habitId,
      owner: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found or unauthorized" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { habits: habitId }
    });

    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHabitPriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const updated = await Habit.findOneAndUpdate(
      { _id: req.params.habitId, owner: req.user._id },
      { priority },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Habit not found." });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const missedHabits = async (req, res) => {
  const userId = req.user._id;

  try {
    const missed = await Habit.find({
      user: userId,
      status: "missed"
    })
      .sort({ actual_due: 1 })
      .limit(5);

    res.status(200).json({ habits: missed });
  } catch (err) {
    console.error("Error fetching missed habits:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getHabitLogs = async (req, res) => {
  try {
    const habits = await Habit.find({ owner: req.user._id }).sort({ createdAt: -1 });

    const habitIds = habits.map(h => h._id);

    const habitLogs = await HabitLog.find({ habit: { $in: habitIds } }).sort({ createdAt: -1 });

    const formattedLogs = habitLogs.map(log => ({
      habitId: log.habit,
      start_time: log.createdAt,
      completion_time: log.date,
      status: log.status,
    }));

    res.json(formattedLogs);
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    res.status(500).json({ message: error.message });
  }
};
