import fs from "fs";
import path from "path";
import { config } from "@sfu/core/config";

import https from "https";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import homeRoute from "./routes/home.route";
import { errorMiddleware, loggingMiddleware, serverErrorMiddleware, serverListenHandler } from "./middlewares/common";

const app: Express = express();

const key = fs.readFileSync(path.join(__dirname, config.sslKey), "utf-8");
const cert = fs.readFileSync(path.join(__dirname, config.sslCrt), "utf-8");
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
app.use("/api", homeRoute);


server.listen(config.listenPort, serverListenHandler(config.listenPort));

// Xử lý lỗi từ server
server.on("error", serverErrorMiddleware);
