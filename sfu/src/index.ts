import express, { Express, Request, Response } from "express";

const app: Express = express();
app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

const PORT = 8333;
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
