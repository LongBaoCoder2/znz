import { SendMessageDto } from "@sfu/dtos/message.dto";
import { createMessage } from "@sfu/data-access/message";
import { getMeetingMessages } from "@sfu/data-access/message";
import { pinMessage, unpinMessage } from "@sfu/data-access/message";

class MessageService {
  async sendMessage(messageDto: SendMessageDto) {
    const { meetingId, userId, content, toUser, isPinned } = messageDto;
    try {
      if (!content || content.length === 0) {
        throw new Error("Message content cannot be empty.");
      }

      const newMessage = await createMessage(meetingId, userId, content, toUser, isPinned);

      return newMessage;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getMeetingMessages(meetingId: number) {
    try {
      if (isNaN(meetingId)) {
        throw new Error("Invalid meetingId.");
      }

      const messages = await getMeetingMessages(meetingId);

      return messages;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateMessagePinStatus(messageId: number, pinStatus: boolean = true) {
    try {
      if (isNaN(Number(messageId))) {
        throw new Error("Invalid messageId.");
      }

      if (pinStatus === true) {
        await pinMessage(messageId);
      } else {
        await unpinMessage(messageId);
      }
      return;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default MessageService;
