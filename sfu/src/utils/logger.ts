import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info", // Mức độ ghi log (info, error, debug)
  format: format.combine(
    format.timestamp(), // Ghi thời gian
    format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Hiển thị log trong console
    new transports.File({ filename: "logs/app.log" }), // Lưu log vào file
  ],
});

export default logger;
