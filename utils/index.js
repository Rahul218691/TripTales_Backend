const fs = require('fs')
const path = require('path')

class HttpError extends Error {
    constructor(message, statusCode) {
      super(message)
      this.statusCode = statusCode || 500
      this.name = this.constructor.name
    }
}

const errorsDir = path.join(__dirname, '../logs')

const logErrorToFile = (error) => {
    const logMessage = `[${new Date().toISOString()}] - ${error.name || 'Error'}: ${error.message}\n${error.stack || 'No stack trace available'}\n\n`;
  
    // Append error log to a file with the current date (e.g., errors/2025-01-23.log)
    const logFilePath = path.join(errorsDir, `${new Date().toISOString().split('T')[0]}.log`);
    
    // Append the error message to the log file
    fs.appendFileSync(logFilePath, logMessage);
};

const calculateReadTime = (text) => {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = text.trim().split(/\s+/).length;
    const totalMinutes = Math.ceil(wordCount / wordsPerMinute); // Total minutes, rounded up

    if (totalMinutes === 0) {
        return 'Less than 1 min'; // Handle very short content
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let readTimeString = '';
    if (hours > 0) {
        readTimeString += `${hours} hr`;
        if (hours > 1) {
            readTimeString += 's'; // Pluralize "hour"
        }
    }

    if (minutes > 0) {
        if (hours > 0) {
            readTimeString += ' '; // Add space between hours and minutes if both exist
        }
        readTimeString += `${minutes} min`;
        if (minutes > 1) {
            readTimeString += 's'; // Pluralize "minute"
        }
    } else if (hours === 0 && totalMinutes > 0) {
        // If minutes is 0 but totalMinutes > 0 (e.g., 60 minutes exactly), show it as 1 hour, not 0 minutes
        // This case is already covered by the hours calculation if totalMinutes is a multiple of 60.
        // This block primarily ensures we show at least "1 min" for short content.
        readTimeString = '1 min'; // Fallback for very short content that rounds to 1 minute
    }

    // Edge case: if totalMinutes is 0 after ceiling, which shouldn't happen with the Math.ceil and wordCount logic
    if (readTimeString === '' && totalMinutes === 0) {
        readTimeString = 'Less than 1 min';
    } else if (readTimeString === '') {
        // If totalMinutes is something like 1, and the above logic doesn't catch it
        readTimeString = `${totalMinutes} min`;
    }

    return readTimeString.trim(); // Trim any extra space
}

module.exports = {
    HttpError,
    logErrorToFile,
    calculateReadTime
}