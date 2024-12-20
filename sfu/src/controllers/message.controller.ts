import { Request, Response } from "express";
import { childLogger } from "@sfu/utils/logger";
import { SendMessageDto } from "@sfu/dtos/message.dto";
import MessageService from "@sfu/services/message.service";
import { getMeetingMessages} from "@sfu/data-access/message";
import { pinMessage, unpinMessage } from "@sfu/data-access/message";

const sfuLogger = childLogger("sfu");

const messageController = {
  sendMesageHandler: async (req: Request, res: Response) => {
    try {
      const messageDto : SendMessageDto = req.body;
      
      const messageService = new MessageService();

      const newMessage = await messageService.sendMessage(messageDto);
      res.status(201).send("Message sent successfully.");
    }
    catch (error: any) {
      sfuLogger.error("Error sending message: ", error);
      if (error.message == "Message content cannot be empty") {
        res.status(400).json({
          message: "Message content cannot be empty."
        })
      }
      else {
        res.status(500).json({
          message: "Error sending message.",
        });
      }
    }
  },

  getMeetingMessagesHandler: async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.meetingId);

      const messageService = new MessageService();
      const messages = await messageService.getMeetingMessages(meetingId);

      res.status(200).json(messages); // Return the messages
    } catch (error: any) {
      sfuLogger.error("Error getting messages: ", error);
      if (error.message == "Invalid meeting ID.") {
        res.status(400).json({
          message: "Invalid meeting ID.",
        })
      }
      else {
        res.status(500).json({
          message: "Error retrieving messages.",
        });
      }
    }
  },

  pinMessageHandler: async (req: Request, res: Response) => {
    const { messageId } = req.params; // Extract messageId from URL params

    try {
      // Ensure messageId is a valid number
      if (!messageId || isNaN(Number(messageId))) {
        res.status(400).json({ message: "Invalid message ID." });
        return;
      }

      await pinMessage(Number(messageId));

      res.status(200).json({ message: "Message pinned successfully." });
    } catch (error: any) {
      sfuLogger.error("Error pinning message: ", error);
      res.status(500).json({
        message: "Error pinning message.",
      });
    }
  },

  unpinMessageHandler: async (req: Request, res: Response) => {
    const { messageId } = req.params; // Extract messageId from URL params

    try {
      // Ensure messageId is a valid number
      if (!messageId || isNaN(Number(messageId))) {
        res.status(400).json({ message: "Invalid message ID." });
        return;
      }

      await unpinMessage(Number(messageId));

      res.status(200).json({ message: "Message unpinned successfully." });
    } catch (error: any) {
      sfuLogger.error("Error unpinning message: ", error);
      res.status(500).json({
        message: "Error unpinning message.",
      });
    }
  }
};

export default messageController;
