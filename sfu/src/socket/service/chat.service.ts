import { childLogger } from '@sfu/core/logger';
import { Room } from '../room/room';

const chatLogger = childLogger('chat');

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

// Store messages per room
const roomMessages = new Map<string, ChatMessage[]>();

export const handleChatEvents = (socket: any) => {
  // Send message to room
  socket.on('chat:message', (data: { content: string }, callback: any) => {
    const roomId = socket.roomId;
    if (!roomId) {
      callback({ error: 'Not in a room' });
      return;
    }

    const room = Room.getRoomById(roomId);
    if (!room) {
      callback({ error: 'Room not found' });
      return;
    }

    const member = room.getMember(socket.id);
    if (!member) {
      callback({ error: 'Member not found' });
      return;
    }

    const message: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      roomId,
      senderId: socket.id,
      senderName: member.username,
      content: data.content,
      timestamp: new Date()
    };

    // Store message
    if (!roomMessages.has(roomId)) {
      roomMessages.set(roomId, []);
    }
    roomMessages.get(roomId)?.push(message);

    // Broadcast to room
    socket.to(roomId).emit('chat:message', message);
    callback({ success: true, message });

    chatLogger.info(`Chat message sent in room ${roomId} by ${member.username}`);
  });

  // Get chat history
  socket.on('chat:history', (callback: any) => {
    const roomId = socket.roomId;
    if (!roomId) {
      callback({ error: 'Not in a room' });
      return;
    }

    const messages = roomMessages.get(roomId) || [];
    callback({ success: true, messages });
  });

  // Clear chat history when room is closed
  socket.on('room:close', () => {
    const roomId = socket.roomId;
    if (roomId) {
      clearRoomMessages(roomId);
    }
  });
};

// Clear messages for a specific room
export const clearRoomMessages = (roomId: string) => {
  roomMessages.delete(roomId);
  chatLogger.info(`Chat history cleared for room ${roomId}`);
};
