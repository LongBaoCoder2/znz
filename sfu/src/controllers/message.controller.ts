import { Request, Response } from "express";
import { childLogger } from "@sfu/utils/logger";
import { SendMessageDto } from "@sfu/dtos/message.dto";
import MessageService from "@sfu/services/message.service";
import { getMeetingMessages } from "@sfu/data-access/message";

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
  },

  getMeetingMessages: async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.meetingId); // Extract meetingId from request params
      if (isNaN(meetingId)) {
        res.status(400).json({ message: "Invalid meeting ID." });
        return;
      }

      const messages = await getMeetingMessages(meetingId); // Call the function from message.ts

      if (!messages || messages.length === 0) {
        res.status(404).json({ message: "No messages found for this meeting." });
        return;
      }

      res.status(200).json(messages); // Return the messages
    } catch (error: any) {
      sfuLogger.error("Error getting messages: ", error);
      res.status(500).json({
        message: "Error retrieving messages.",
      });
    }
  }
};

export default messageController;
