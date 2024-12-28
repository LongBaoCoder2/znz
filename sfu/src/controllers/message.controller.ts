import { Request, Response } from "express";
import { childLogger } from "@sfu/core/logger";
import { SendMessageDto } from "@sfu/dtos/message.dto";
import MessageService from "@sfu/services/message.service";

const sfuLogger = childLogger("sfu");

const messageController = {
  sendMesageHandler: async (req: Request, res: Response) => {
    try {
      const messageDto: SendMessageDto = req.body;

      const messageService = new MessageService();
      const createdMessage = await messageService.sendMessage(messageDto);

      res.status(201).json({
        message: "Message sent successfully.",
        data: createdMessage
      });
    } catch (error: any) {
      sfuLogger.error("Error sending message: ", error);

      const statusCode = error.message === "Message content cannot be empty." ? 400 : 500;
      const errorMessage = statusCode === 400 ? "Message content cannot be empty." : "Error sending message.";

      res.status(statusCode).json({
        message: errorMessage
      });
    }
  },

  getMeetingMessagesHandler: async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.meetingId, 10);

      const messageService = new MessageService();
      const meetingMessages = await messageService.getMeetingMessages(meetingId);

      res.status(200).json({
        message: "Messages retrieved successfully.",
        data: meetingMessages
      });
    } catch (error: any) {
      sfuLogger.error("Error retrieving meeting messages: ", error);

      const statusCode = error.message === "Invalid meetingId." ? 400 : 500;
      const errorMessage = statusCode === 400 ? "Invalid meetingId." : "Error sending message.";

      res.status(statusCode).json({
        message: errorMessage
      });
    }
  },

  pinMessageHandler: async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.messageId, 10);

      const messageService = new MessageService();
      await messageService.updateMessagePinStatus(messageId, true);

      res.status(200).json({ message: "Message pinned successfully." });
    } catch (error: any) {
      sfuLogger.error("Error pinning message: ", error);

      const statusCode = error.message === "Invalid messageId." ? 400 : 500;
      const errorMessage = statusCode === 400 ? "Invalid messageId." : "Error pinning message.";

      res.status(statusCode).json({
        message: errorMessage
      });
    }
  },

  unpinMessageHandler: async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.messageId, 10);

      const messageService = new MessageService();
      await messageService.updateMessagePinStatus(messageId, false);

      res.status(200).json({ message: "Message pinned successfully." });
    } catch (error: any) {
      sfuLogger.error("Error unpinning message: ", error);

      const statusCode = error.message === "Invalid messageId." ? 400 : 500;
      const errorMessage = statusCode === 400 ? "Invalid messageId." : "Error unpinning message.";

      res.status(statusCode).json({
        message: errorMessage
      });
    }
  }
};

export default messageController;
