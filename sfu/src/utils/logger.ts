import { createLogger, format, transports } from "winston";

// Tên ứng dụng cố định
const APP_NAME = "ZNZ";

const logger = createLogger({
  level: "info", // Mức độ ghi log (info, error, debug)
  format: format.combine(
    format.timestamp(), // Ghi thời gian
    format.printf(({ level, message, timestamp, ...meta }) => {
      const component = meta.component || "unknown"; // Thành phần như sfu hoặc client
      return `${timestamp} [${level.toUpperCase()}] [App: ${APP_NAME}] [Component: ${component}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(), // Hiển thị log trong console
    new transports.File({ filename: "logs/app.log" }), // Lưu log vào file
  ],
});

/**
 * Tạo logger con với thông tin thành phần
 * @param component Thành phần cụ thể (vd: sfu, client)
 */
export const childLogger = (component: string) => {
  return logger.child({ component }); // Gắn metadata component vào logger con
};

export default logger;
