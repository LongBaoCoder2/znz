import { Request, Response, NextFunction } from "express";
import { childLogger } from "@sfu/utils/logger";

const sfuLogger = childLogger("sfu");

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  sfuLogger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
};

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  sfuLogger.error(`Error occurred: ${err.message}`);
  res.status(500).send("Something went wrong!");
};

export const serverErrorMiddleware = (error: Error) => {
  sfuLogger.error(`Server error: ${error.message}`);
};

export const serverListenHandler = (PORT: any) => () => {
  sfuLogger.info(`Server is running at https://localhost:${PORT}`);
};
