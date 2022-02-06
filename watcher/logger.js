const { createLogger, format, transports } = require('winston');
const { combine, timestamp, ms, json, prettyPrint, simple, printf } = format;

const customFormat = printf(({ level, message, label, timestamp, ms }) => {
  return `${timestamp} [${level}] [${ms}]: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    ms(),
    customFormat,
  ),
  transports: [
    new transports.File({ filename: 'watcher.log' }),
    new transports.Console()
  ],
});

module.exports = logger;
