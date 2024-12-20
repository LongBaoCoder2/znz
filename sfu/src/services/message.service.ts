import { SendMessageDto } from "@sfu/dtos/message.dto";
import { createMessage } from "@sfu/data-access/message";
import { getMeetingMessages } from "@sfu/data-access/message";

class MessageService {
  async sendMessage(messageDto: SendMessageDto) {
    const { meetingId, userId, content, toUser, isPinned } = messageDto;
    try {
      if (!content || content.length === 0) {
        throw new Error("Message content cannot be empty");
      }

      const newMessage = await createMessage(meetingId, userId, content, toUser, isPinned);
      
      return newMessage;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getMeetingMessages(meetingId: number) {
    if (isNaN(meetingId)) {
      throw new Error("Invalid meeting ID.");
    }

    // Call the function from message.ts
    const messages = await getMeetingMessages(meetingId);
    return messages;
  }
};

export default MessageService;
