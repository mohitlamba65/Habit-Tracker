import Agenda from 'agenda';
if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then(dotenv => dotenv.config());
}


const agenda2 = new Agenda({
  db: {
    address: process.env.MONGODB_URI,
    collection: 'agendaJobs',
  },
});

export default agenda2;
