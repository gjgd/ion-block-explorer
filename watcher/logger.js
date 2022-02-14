const { createLogger, format, transports } = require('winston');

const { combine, timestamp: timestampFormat, ms: msFormat, printf } = format;

const customFormat = printf(({ level, message, timestamp, ms }) => {
  return `${timestamp} [${level}] [${ms}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(timestampFormat(), msFormat(), customFormat),
  transports: [
    new transports.File({ filename: 'watcher.log' }),
    new transports.Console(),
  ],
});

module.exports = logger;
