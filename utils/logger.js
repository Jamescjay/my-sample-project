// utils/logger.js
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");

const logTransport = new DailyRotateFile({
  filename: "logs/%DATE%-log.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    logTransport,
  ],
});

module.exports = logger;
