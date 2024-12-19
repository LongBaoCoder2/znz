import { Request, Response } from "express";
import { childLogger } from "@sfu/utils/logger";
import { SendMessageDto } from "@sfu/dtos/message.dto";
import MessageService from "@sfu/services/message.service";

const sfuLogger = childLogger("sfu");

const messageController = {
  sendMesageHandler: async (req: Request, res: Response) => {
    try {
      const messageDto : SendMessageDto = req.body;
      
      const messageService = new MessageService();

      const newMessage = await messageService.sendMessage(messageDto);
      res.status(201).send("Mesage sent successfully.");
    }
    catch (error: any) {
      sfuLogger.error("Error sending message: ", error);
      res.status(500).json({
        message: "Error sending message.",
      });
    }
  }
};

export default messageController;
