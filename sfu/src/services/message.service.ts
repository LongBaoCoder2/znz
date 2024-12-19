import { SendMessageDto } from "@sfu/dtos/message.dto";
import { createMessage } from "@sfu/data-access/message";  // Database helper function

class MessageService {
  // Function to send a message
  async sendMessage(messageDto: SendMessageDto) {
    const { meetingId, userId, content, toUser, isPinned } = messageDto;
    try {
      // Call the data-access function to create a new message in the database
      const newMessage = await createMessage(meetingId, userId, content, toUser, isPinned);
      
      // Optionally, you can do additional logic here (e.g., send notifications)
      return newMessage;
    } catch (error: any) {
      throw new Error("Error sending message: " + error.message);
    }
  }
}

export default MessageService;
