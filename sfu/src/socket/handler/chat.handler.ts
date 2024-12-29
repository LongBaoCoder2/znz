import { Socket } from 'socket.io';
import { handleChatEvents } from '../service/chat.service';
import { childLogger } from '@sfu/core/logger';

const sfuLogger = childLogger('sfu');

export const setupChatHandler = (chatListener: any) => {
  // Initialize chat event handlers
  chatListener.on('connection', (socket: any) => {
    sfuLogger.info(`Chat client connected: ${socket.id}`);    
    handleChatEvents(socket);
  });
};
