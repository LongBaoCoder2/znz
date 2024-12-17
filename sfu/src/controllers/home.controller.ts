import { Request, Response } from "express";
import { childLogger } from "@sfu/utils/logger";

const sfuLogger = childLogger("sfu");

const homeController = {
  indexHandler: (req: Request, res: Response) => {
    sfuLogger.info("Handling request to '/'");
    res.send("Index route.");
  }
};

export default homeController;
