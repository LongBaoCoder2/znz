import { Request, Response } from "express";
import { childLogger } from "@sfu/utils/logger";

const sfuLogger = childLogger("sfu");

const meetingController = {
  sampleHandler: (req: Request, res: Response) => {
    sfuLogger.info("Some log");
    res.send("Something.");
  }
};

export default meetingController;
