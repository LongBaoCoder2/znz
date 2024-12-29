import { Server as SocketIOServer } from 'socket.io';
import { Room } from './room/room';
import * as mediasoupService from './service/mediasoup.service';
import { createWorkers } from './worker/worker';
import { MemberSFU } from './types';
import { childLogger } from '@sfu/core/logger';
import setupMediasoupHandler from './handler/mediasoup.handler';
import { setupChatHandler } from './handler/chat.handler';

const sfuLogger = childLogger('sfu');

// Setup Socket Server
export const setupSocketServer = async (httpServer: any) => {
  const io = new SocketIOServer(httpServer, {
      path: '/socket',
      cors: {
          origin: '*'
      }
  });

  const sfuListener = io.of('/sfu');

  // Create mediasoup workers
  await createWorkers();

  setupMediasoupHandler(sfuListener);

  // Handle chat events
  setupChatHandler(sfuListener);    
}