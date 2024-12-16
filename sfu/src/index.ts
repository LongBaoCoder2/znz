import fs from "fs";
import path from "path";

import "dotenv/config.js";
import { childLogger } from "@sfu/utils/logger"; 
import https from "https";
import cors from "cors";
import cookieParser from 'cookie-parser';
import express, { Express, Request, Response, NextFunction } from "express";
import homeRoute from "./routes/home.route";

const app: Express = express();

const key = fs.readFileSync(path.join(__dirname, "../ssl/localhost.key"), "utf-8");
const cert = fs.readFileSync(path.join(__dirname, "../ssl/localhost.crt"), "utf-8");

const server = https.createServer({ key, cert }, app);


// Tạo logger dành riêng cho SFU
const sfuLogger = childLogger("sfu");

app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cookieParser());
app.use(cors({ origin: true,  
  credentials: true, 
}));

// Middleware log tất cả request
app.use((req: Request, res: Response, next: NextFunction) => {
  sfuLogger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Middleware xử lý lỗi
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  sfuLogger.error(`Error occurred: ${err.message}`);
  res.status(500).send("Something went wrong!");
});


/* ================= Define route ================= */
app.use("/api", homeRoute);



const PORT = process.env.PORT || 6333;
server.listen(PORT, () => {
  sfuLogger.info(`Server is running at https://localhost:${PORT}`);
});

// Xử lý lỗi từ server
server.on("error", (error: Error) => {
  sfuLogger.error(`Server error: ${error.message}`);
});