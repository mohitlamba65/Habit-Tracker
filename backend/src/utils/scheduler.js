import cron from 'node-cron';
import { Productivity } from '../models/productivity.model.js';
import { Prediction } from '../models/prediction.model.js';
import { analyzeProductivity } from '../utils/analyzeProductivity.js';
import { User } from '../models/user.model.js';
import { Habit } from '../models/habit.model.js';
import { sendEmail } from '../utils/sendReminder.js';
import { sendWhatsApp } from '../utils/sendWhatsApp.js';
import webpush from 'web-push';

// Configure web-push VAPID keys
webpush.setVapidDetails(
  'mailto:example@studyflow.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

cron.schedule('0 */12 * * *', async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      const logs = await Productivity.find({ user: user._id });
      const peakHours = analyzeProductivity(logs);

      await Prediction.create({
        user: user._id,
        peak_productivity_times: peakHours,
      });

      if (user.notificationSettings?.enabled) {
        const pendingHabits = await Habit.find({ owner: user._id, status: false });
        if (!pendingHabits.length) continue;

        const taskList = pendingHabits
          .map((h, i) => `${i + 1}. ${h.habit} (Due: ${h.completion_time})`)
          .join('\n');

        const message = `Hi ${user.name || 'there'},\n\nHere are your pending tasks:\n${taskList}`;

        if (user.notificationSettings.email) {
          await sendEmail(user.email, '⏰ Habit Reminder', message);
        }

        if (user.notificationSettings.whatsapp && user.phone) {
          await sendWhatsApp(user.phone, message);
        }

        if (user.pushSubscription && user.notificationSettings.push) {
          await webpush.sendNotification(user.pushSubscription, JSON.stringify({
            title: 'Habit Reminder',
            body: message,
          }));
        }
      }
    }

    console.log('🕑 12-hourly reminders and predictions sent.');
  } catch (error) {
    console.error('Reminder/prediction error:', error);
  }
});
