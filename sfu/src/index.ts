import express, { Express, Request, Response } from "express";
import https from "https";
import fs from "fs";
import path from "path";

// Tạo ứng dụng Express
const app: Express = express();

// Đọc chứng chỉ và khóa SSL
const key = fs.readFileSync(path.join(__dirname, "../ssl/localhost.key"), "utf-8");
const cert = fs.readFileSync(path.join(__dirname, "../ssl/localhost.crt"), "utf-8");


// Tạo HTTPS server
const server = https.createServer({ key, cert }, app);

// Middleware Express
app.get("/", (req: Request, res: Response) => {
  res.send("This is a secure server");
});

const PORT = 8333;
server.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
