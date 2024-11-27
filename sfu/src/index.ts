import express, { Express, Request, Response, NextFunction } from "express";
import https from "https";
import fs from "fs";
import path from "path";
import logger from "./utils/logger"; // Import logger

const app: Express = express();

const key = fs.readFileSync(path.join(__dirname, "../ssl/localhost.key"), "utf-8");
const cert = fs.readFileSync(path.join(__dirname, "../ssl/localhost.crt"), "utf-8");

const server = https.createServer({ key, cert }, app);

// Middleware log tất cả request
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Route xử lý chính
app.get("/", (req, res) => {
  logger.info("Handling request to '/'");
  res.send("This is a secure server");
});

// Middleware xử lý lỗi
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error occurred: ${err.message}`);
  res.status(500).send("Something went wrong!");
});

// Lắng nghe request
server.listen(3001, () => {
  logger.info("Server is listening on port 3001");
});

// Xử lý lỗi từ server
server.on("error", (error) => {
  logger.error(`Server error: ${error.message}`);
});
