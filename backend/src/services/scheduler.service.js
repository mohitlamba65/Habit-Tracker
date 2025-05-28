import Agenda from "agenda"
import { habitReminderJob } from "../jobs/habitReminder.job.js";
import { habitMissedCheckJob } from "../jobs/habitMisssedCheck.job.js";

// Use a singleton pattern for Agenda
const mongoConnectionString = process.env.MONGODB_URI;

const agenda = new Agenda({ 
    db: { 
        address: mongoConnectionString,
        collection: 'agendaJobs'
    },
    processEvery: '30 seconds' // Check for due jobs every 30 seconds
});

// Register jobs
habitReminderJob(agenda);
habitMissedCheckJob(agenda);

// Handle agenda errors
agenda.on('error', (err) => {
    console.error('Agenda error:', err);
});

// Set up the habit missed check job
agenda.on('ready', async () => {
    try {
        // Use 15 minutes interval for testing
        await agenda.every('15 minutes', 'habitMissedCheck');
        console.log('Habit missed check job scheduled');
    } catch (err) {
        console.error('Failed to schedule habitMissedCheck job:', err);
    }
});

export { agenda }