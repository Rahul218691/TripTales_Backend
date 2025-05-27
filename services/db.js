const mongoose = require('mongoose')
const Agenda = require('agenda');

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URL, // Your MongoDB connection string
    collection: 'agendaJobs' // A collection to store agenda jobs
  },
  processEvery: '10 seconds' // How often agenda checks for new jobs
});

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URL)
    console.log(`Mongodb connected to ${conn.connection.host}`)
}

module.exports = {
  connectDB,
  agenda
}