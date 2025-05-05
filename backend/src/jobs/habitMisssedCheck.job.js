import { Habit } from '../models/habit.model.js';
import { sendEmailNotification, sendWhatsAppNotification } from '../services/notification.service.js';

import { DateTime } from "luxon"; 

export const habitMissedCheckJob = (agenda) => {
  agenda.define("habitMissedCheck", async () => {
    try {
      // Get current time in IST
      const nowIST = DateTime.now().setZone("Asia/Kolkata").toJSDate();

      // Get all pending habits where due time has passed
      const overdueHabits = await Habit.find({
        status: "pending",
        actual_due: { $lt: nowIST },
      }).populate("owner");

      for (const habit of overdueHabits) {
        habit.status = "missed";
        await habit.save();

        const message = `⚠️ You missed your habit "${habit.habit}". Don't worry, try again tomorrow!`;

        const email = habit.owner?.email;
        const phone = habit.owner?.phone;

        if (email) await sendEmailNotification(email, "Habit Missed", message);
        if (phone) await sendWhatsAppNotification(phone, message);
      }

      console.log(`${overdueHabits.length} habits marked as missed.`);
    } catch (error) {
      console.error("Error in missed habit check:", error);
    }
  });
};
