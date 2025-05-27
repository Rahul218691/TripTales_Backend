require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const ratelimit = require('express-rate-limit')
const morgan = require('morgan')

const { logErrorToFile } = require('./utils')
const routes = require('./routes')
const { connectDB, agenda } = require('./services/db')
require('./services/agendaJobs/createStoryAgenda') // Import the job definition

const app = express()

const limiter = ratelimit({
    windowMs: 1 * 60 * 1000,
    limit: 100,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
})

  
agenda.on('start', (job) => {
    console.log(`Job ${job.attrs.name} started`);
});

agenda.on('complete', (job) => {
    console.log(`Job ${job.attrs.name} completed`);
});

agenda.on('fail', (err, job) => {
    console.error(`Job ${job.attrs.name} failed with error: ${err.message}`);
});


app.set('trust proxy', true); 
app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(limiter)

// X-Request_Source header check
app.use((req, res, next) => {
    const sourceHeader = req.get('X-Request_Source')
    if (!sourceHeader) {
        return res.status(403).json({
            message: 'Forbidden Permission denied'
        })
    } else if (sourceHeader !== process.env.CLIENT_BASE_URL) {
        return res.status(403).json({
            message: 'Forbidden Permission denied'
        })
    } else {
        next()
    }
})

app.use(routes)

// 404 route (if no match)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found', message: 'Route not found' });
})

// Global error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      error: err.name || 'Internal Server Error',
      message: err.message || 'Something went wrong',
    });
});

process.on('uncaughtException', (err) => {
    logErrorToFile(err)
})

process.on('unhandledRejection', (err) => {
    logErrorToFile(err)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server Running on PORT ${PORT}`)
    connectDB().then(() => {
        (async function() {
            await agenda.start();
            console.log('Agenda started for job processing.');
        })();
    })
})