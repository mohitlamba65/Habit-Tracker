import { sendEmailNotification, sendWhatsAppNotification } from '../services/notification.service.js';
import { Habit } from '../models/habit.model.js';

export const habitReminderJob = (agenda) => {
    agenda.define('habitReminder', async (job) => {
      const { habitId, userEmail, userPhone, name } = job.attrs.data;
  
      const message = `⏰ Reminder: Your habit "${name}" is scheduled soon. Stay on track!`;
  
      try {
        await sendEmailNotification(userEmail, 'Habit Reminder', message);
        await sendWhatsAppNotification(userPhone, message);
  
        await agenda.schedule('in 25 minutes', 'habitFollowUpReminder', {
          habitId,
          userEmail,
          userPhone,
          name
        });
      } catch (error) {
        console.error('Initial reminder failed:', error);
      }
    });
  
    agenda.define('habitFollowUpReminder', async (job) => {
      const { habitId, userEmail, userPhone, name } = job.attrs.data;
  
      try {
        const habit = await Habit.findById(habitId);
        if (!habit || habit.status === 'completed') {
          return;
        }
  
        const followUpMessage = `🔁 Follow-up: You haven't marked "${name}" as complete. Let's go! 🚀`;
  
        await sendEmailNotification(userEmail, 'Reminder: Habit Still Pending', followUpMessage);
        await sendWhatsAppNotification(userPhone, followUpMessage);
      } catch (error) {
        console.error('Follow-up reminder failed:', error);
      }
    });
  };

