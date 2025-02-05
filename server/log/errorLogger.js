const { createLogger, transports, format } = require("winston");
const { combine, timestamp, simple } = format;

const logger = createLogger({
  level: "error",
  format: combine(timestamp(), simple()),
  transports: [
    new transports.File({
      filename: "./logs/error.log",
      level: "error",
      timestamp: true,
    }),
  ],
});

module.exports = logger;