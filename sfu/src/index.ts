import fs from "fs";
import path from "path";

import "dotenv/config.js";
import https from "https";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import homeRoute from "./routes/home.route";
import messageRoute from "./routes/message.route";
import { errorMiddleware, loggingMiddleware, serverErrorMiddleware, serverListenHandler } from "./middlewares/common";
import AuthRoute from "./routes/auth.route";

const app: Express = express();

const key = fs.readFileSync(path.join(__dirname, "../ssl/localhost.key"), "utf-8");
const cert = fs.readFileSync(path.join(__dirname, "../ssl/localhost.crt"), "utf-8");
const server = https.createServer({ key, cert }, app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Middleware log tất cả request
app.use(loggingMiddleware);

// Middleware xử lý lỗi
app.use(errorMiddleware);

/* ================= Define route ================= */
const authRoute = (new AuthRoute()).router
app.use("/api", homeRoute);
app.use("/api", messageRoute);
app.use("/api", authRoute);

// const PORT = process.env.PORT || 8000;
const PORT = 3334;
server.listen(PORT, serverListenHandler(PORT));

// Xử lý lỗi từ server
server.on("error", serverErrorMiddleware);
