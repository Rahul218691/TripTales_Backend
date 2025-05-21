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

module.exports = {
    HttpError,
    logErrorToFile
}