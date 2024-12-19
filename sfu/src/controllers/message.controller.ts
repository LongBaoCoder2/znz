import { Request, Response } from "express";
import { childLogger } from "@sfu/utils/logger";
import { SendMessageDto } from "@sfu/dtos/message.dto";
import { MessageService } from "@sfu/services/message.service";

const sfuLogger = childLogger("sfu");

const messageController = {
  sendMesageHandler: async (req: Request, res: Response) => {
    try {
      const messageDto : SendMessageDto = req.body;
      
      const newMessage = await MessageService.sendMessage(messageDto);
      return res.status(200);
    }
    catch (error: any) {
      sfuLogger.error("Error sending message: ", error);
      return res.status(500).json({
        message: "Error sending message",
      });
    }
  }
};

export default messageController;
