
import Agenda from 'agenda';
import dotenv from 'dotenv';
dotenv.config();

const agenda2 = new Agenda({
  db: {
    address: process.env.MONGODB_URI,
    collection: 'agendaJobs',
  },
});

export default agenda2;
