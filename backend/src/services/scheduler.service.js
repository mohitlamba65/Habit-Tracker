import Agenda from "agenda"
import { habitReminderJob } from "../jobs/habitReminder.job.js";
import { habitMissedCheckJob } from "../jobs/habitMisssedCheck.job.js";
const mongoConnectionString = process.env.MONGODB_URI;

const agenda = new Agenda({ db: { address: mongoConnectionString } });

habitReminderJob(agenda)
habitMissedCheckJob(agenda)

// agenda.on('ready', async () => {
//     await agenda.every('at 11:59pm', 'habitMissedCheck');
// });

//short interval for testing
agenda.on('ready', async () => {
    await agenda.every('15 minutes', 'habitMissedCheck'); 
  });
  
export{agenda}
