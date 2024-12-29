import { childLogger } from '@sfu/core/logger';
import * as mediasoupService from '../service/mediasoup.service';
import { Room } from '../room/room';
import { MemberSFU } from '../types';
import { clearRoomMessages } from '../service/chat.service';

const sfuLogger = childLogger('sfu');

const setupMediasoupHandler = (sfuListener: any) => {
  // Listen for client connections
  sfuListener.on('connection', (socket: any) => {
    sfuLogger.info(`Client connected: ${socket.id}`);

    // Clean up on disconnect
    socket.on('disconnect', () => {
        const roomId = socket.roomId;

        let newHostId = undefined;
        if (mediasoupService.isHost(roomId, socket.id)) {
          newHostId = mediasoupService.transferHostDefault(roomId, socket.id);
        }

        // Clear message
        if (mediasoupService.getMemberSize(roomId) === 1) {
          sfuLogger.info(`Chat history cleared for room ${roomId}`);
          clearRoomMessages(roomId);
        }

        mediasoupService.clearPeer(roomId, socket);
        socket.to(roomId).emit('member:left', { socketId: socket.id, newHostId });
        sfuLogger.info(`Client disconnected: ${socket.id}`);
        socket.leave(roomId);
    })

    // ==================== Room ====================
    socket.on('room:setup', async (data: { roomId: string, username: string }, callback: any) => {
      const room = Room.getRoomById(data.roomId);
      if (!room) {
        callback(null, { type: 'empty' });
        return;
      }

      socket.roomId = data.roomId;
      const member: MemberSFU = {
        socketId: socket.id,
        username: data.username,
        role: 'participant',
        status: 'pending',
        joinedAt: new Date(),
        isAudioMuted: false,
        isVideoMuted: false
      };

      socket.join(getRoomId());
      const addedMember = room.addMember(member);
      sfuLogger.info(`room:setup newMember: ${JSON.stringify(addedMember)}`);
      if (addedMember.role === 'participant') {
        sfuLogger.info(`room:setup request to host: ${room.hostSocketId as string}`);
        socket.to(room.hostSocketId!).emit('join:request', {
          username: data.username,
          socketId: socket.id
        });
      } 

      callback({ status: addedMember.status, role: addedMember.role }, null);
    });

    
    socket.on('join:response', (data: { socketId: string, approved: boolean }) => {
      const roomId = getRoomId();
      const room = Room.getRoomById(roomId);
      if (room?.isHost(socket.id)) {
        room.updateMemberStatus(data.socketId, data.approved ? 'approved' : 'rejected');
        socket.to(data.socketId).emit('join:result', { approved: data.approved });

        sfuLogger.info(`join:response: ${data.approved ? 'approved' : 'rejected'} for ${data.socketId}`);
        if (data.approved) {
          const newMember = room.getMember(data.socketId);
          sfuLogger.info(`${newMember?.username} joined the room`);
          socket.emit('member:joined', {
            username: newMember?.username,
            socketId: data.socketId,
            joinedAt: newMember?.joinedAt
          })
          socket.to(roomId).except(data.socketId).emit('member:joined', {
            username: newMember?.username,
            socketId: data.socketId,
            joinedAt: newMember?.joinedAt
          });
          sfuLogger.info(`member:joined successfully: ${newMember?.username} joined the room`);
        }
      }
    });

    // ==================== Member ====================
    // socket.on('member:remove', (data: { socketId: string }) => {
    //   const roomId = getRoomId();
    //   const room = Room.getRoomById(roomId);
    //   if (room?.isHost(socket.id)) {
    //     room.removeMember(data.socketId);
    //     socket.to(roomId).emit('member:left', { socketId: data.socketId });
    //   }
    // });


    socket.on('member:getAll', (data: any, callback: any) => {
      const roomId = getRoomId();
      const allMember = mediasoupService.getAllMembers(roomId);
      
      if (allMember) {
        sfuLogger.info(`member:getAll: ${JSON.stringify(allMember)}`);
        callback(Object.values(allMember)
                 .filter(member => member.status === 'approved' && member.socketId !== socket.id), null);
      } else {
        sfuLogger.info('member:getAll: missing room');
        callback(null, { message: 'Room not found' });
      }
    });



    // ==================== Router ====================
    /**
     * Router event:
     * createRouter
     * @param data: { }
     * @returns { rtpCapabilities }
     */
    socket.on('getRouterRtpCapabilities', (data: any, callback: any) => {
        const roomId = getRoomId();
        const room = Room.getRoomById(roomId);
        if (!room) {
            callback(null, { message: '[getRouterRtpCapabilities]: there is no room' })
            return;
        }

        if (room.router) {
            callback(room.router.rtpCapabilities, null);
        }
        else {
            callback(null, { message: '[getRouterRtpCapabilities]: there is no router' });
        }
    });



    // ==================== Producer ====================
    /**
     * Producer event: 
     * createProducerTransport
     * @param data: { }
     * @returns { params: { id, iceParameters, iceCandidates, dtlsParameters } }
     * 
     */
    socket.on('createProducerTransport', async (data: any, callback: any) => {
      const roomId = getRoomId();
      const result = await mediasoupService.createWebRtcTransport(roomId);
      if (!result) {
        callback(null, { message: `Failed to create WebRTC transport in room: ${roomId}` });
        return;
      }
      
      const { transport, params } = result;
      mediasoupService.addProducerTransport(roomId, socket.id, transport);
      transport.observer.on('close', () => {
        const id = socket.id;
        const videoProducer = mediasoupService.getProducer(roomId, id, 'video');
        if (videoProducer) {
            videoProducer.close();
            mediasoupService.removeProducer(roomId, id, 'video');
        }
        const audioProducer = mediasoupService.getProducer(roomId, id, 'audio');
        if (audioProducer) {
            audioProducer.close();
            mediasoupService.removeProducer(roomId, id, 'audio');
        }
        mediasoupService.removeProducerTransport(roomId, id);
    });

      callback(params, null);
    });

    /**
     * Producer event:
     * connectProducerTransport
     * @param data: { dtlsParameters }
     * @returns { }
     */
    socket.on('connectProducerTransport', async (data: { dtlsParameters: any} , callback: any) => {
        const roomId = getRoomId();
        const id = socket.id;
        const transport = mediasoupService.getProducerTransport(roomId, id);
        if (!transport) {
            callback(null, { message: '[connectProducerTransport]: there is no transport' });
            return;
        }

        await transport.connect({ dtlsParameters: data.dtlsParameters });
        callback({}, null);
    });


    /**
     * Producer event:
     * produce
     * @param data: { kind, rtpParameters }
     * @returns { id }
     * @description When user streams video/audio, this event will be called
     */
    socket.on('produce', async (data: {kind: any, rtpParameters: any}, callback: any) => {
        const roomId = getRoomId();
        const id = socket.id;
        const { kind, rtpParameters } = data;
        
        const transport = mediasoupService.getProducerTransport(roomId, id);
        if (!transport) {
            sfuLogger.info('transport NOT EXIST for id=' + id);
            return;
        }
        const producer = await transport.produce({ kind, rtpParameters });
        mediasoupService.addProducer(roomId, id, producer, kind);
        producer.observer.on('close', () => {
            sfuLogger.info('producer closed --- kind=' + kind);
        })
        callback({ id: producer.id }, null);

        // inform clients about new producer
        sfuLogger.info('-- broadcast newProducer ---');
        socket.broadcast.to(roomId).emit('newProducer', { 
            socketId: id, 
            producerId: producer.id, 
            kind: producer.kind, 
            username: socket.username 
        });
    });

    // ==================== Consumer ====================
    /**
     * Consumer event:
     * createConsumerTransport
     * @param data: { }
     * @returns { params: { id, iceParameters, iceCandidates, dtlsParameters } }
     */
    socket.on('createConsumerTransport', async (data: any, callback: any) => {
        const roomId = getRoomId();
        sfuLogger.info('create consumer transport. socket id=' + socket.id);
        const { transport, params }: any = await mediasoupService.createWebRtcTransport(roomId);
        
        mediasoupService.addConsumerTransport(roomId, socket.id, transport);
        transport.observer.on('close', () => {
            const id = socket.id;
            mediasoupService.removeAllConsumersOfClient(roomId, id)
            mediasoupService.removeConsumerTransport(roomId, id);
        })

        callback(params, null);
    });

    /**
     * Consumer event:
     * connectConsumerTransport
     * @param data: { dtlsParameters }
     * @returns { }
     */
    socket.on('connectConsumerTransport', async (data: { dtlsParameters: any }, callback: any) => {
        const roomId = getRoomId();
        const transport = mediasoupService.getConsumerTransport(roomId, socket.id);
        if (!transport) {
            sfuLogger.info(`transport NOT EXIST for id=${socket.id}}`);
            callback(null, { message: '[connectConsumerTransport]: there is no transport' });
            return;
        }

        await transport.connect({ dtlsParameters: data.dtlsParameters });
        callback({}, null);
    });


    /**
     * Consumer event:
     * @returns { params: { id, producerId, kind, rtpParameters } }
     */
    socket.on('getAllRemoteProducerIds', async (data: any, callback: any) => {
        const roomId = getRoomId();
        const clientId = data.localId;
        // const clientId = socket.id;
        const otherProducersVideoIds = mediasoupService.getAllRemoteProducerIds(roomId, clientId, 'video');
        const otherProducersAudioIds = mediasoupService.getAllRemoteProducerIds(roomId, clientId, 'audio');
        const allMembers = mediasoupService.getAllMembers(roomId);

        if (!allMembers) {
            sfuLogger.info('getAllMembers: no members');
        }

        const membersObject = Object.fromEntries(allMembers || []);
        sfuLogger.info(`getAllMembers: ${membersObject}`);
        

        callback({ VideoIds: otherProducersVideoIds, AudioIds: otherProducersAudioIds, Members: membersObject }, null);
    });

    /**
     * Consumer event:
     * consumeAdd
     * @param data: { producerId, kind, rtpCapabilities }
     * @returns { params: { producerId, id, kind, rtpParameters, type, producerPaused } }\
     * @description When a producer is producing, this event will be called
     */
    socket.on('consumeAdd', async (data: { kind: 'video' | 'audio', rtpCapabilities: any, producerId: any}, callback: any) => {
        const roomId = getRoomId();
        const clientId = socket.id;
        const { kind, rtpCapabilities, producerId } = data;

        let transport = mediasoupService.getConsumerTransport(roomId, clientId);
        if (!transport) {
            sfuLogger.info('consumeAdd: cannot find transport');
            return;
        }

        const producer = mediasoupService.getProducer(roomId, producerId, kind);
        if (!producer) {
            sfuLogger.info('consumeAdd: cannot find producer');
            return;
        }

        const { consumer, params }: any = await mediasoupService.createConsumer(roomId, transport, producer, rtpCapabilities);
        mediasoupService.addConsumer(roomId, clientId, producerId, consumer, kind);
        consumer.observer.on('close', () => {
            sfuLogger.info('consumer closed ---');
        })
        consumer.on('producerclose', () => {
            sfuLogger.info('consumer -- on.producerclose');
            consumer.close();
            mediasoupService.removeConsumer(roomId, clientId, producerId, kind);

            // -- notify to client ---
            socket.emit('producerClosed', { clientId: clientId, producerId: producerId, kind: kind });
        });

        callback(params, null);
    });

    /**
     * Consumer event:
     * resumeAdd
     * @param data: { producerId, kind }
     * @returns { }
     */
    socket.on('resumeAdd', async (data: { kind: "video" | "audio", producerId: any }, callback: any) => {
        const roomId = getRoomId();
        const clientId = socket.id;
        const { producerId, kind } = data;

        sfuLogger.info('-- resumeAdd localId=%s remoteId=%s kind=%s', clientId, producerId, kind);
        let consumer = mediasoupService.getConsumer(roomId, clientId, producerId, kind);
        if (!consumer) {
            sfuLogger.error('consumer NOT EXIST for remoteId=' + producerId);
            callback(null, 'consumer NOT EXIST for remoteId=' + producerId);
            return;
        }
        await consumer.resume();
        callback({}, null);
    });


    // ==================== On/Off Stream ====================
    /**
     * On/Off Stream event:
     * myVideoOff
     * @param data: { }
     * @returns { }
     */
    socket.on('myVideoOff', (data: any, callback: any) => {
        const roomId = getRoomId();
        const producer = mediasoupService.getProducer(roomId, socket.id, 'video');

        if(producer && !producer.paused){
            producer.pause();
        }
        socket.broadcast.to(roomId).emit('producerVideoOff', { 
            socketId: socket.id
        });
    });

    
    socket.on('myVideoOn', (data: any, callback: any) => {
        const roomId = getRoomId();
        const producer = mediasoupService.getProducer(roomId, socket.id, 'video');
        if(producer && producer.paused){
            producer.resume();
        }
        socket.broadcast.to(roomId).emit('producerVideoOn', { 
            socketId: socket.id
        });
    });


    socket.on('myAudioOff', (data: any, callback: any) => {
        const roomId = getRoomId();
        const producer = mediasoupService.getProducer(roomId, socket.id, 'audio');
        if(producer && !producer.paused){
            producer.pause();
        }
        socket.broadcast.to(roomId).emit('producerAudioOff', { 
            socketId: socket.id
        });
    });


    socket.on('myAudioOn', (data: any, callback: any) => {
        const roomId = getRoomId();
        const producer = mediasoupService.getProducer(roomId, socket.id, 'audio');
        if(producer && producer.paused){  
            producer.resume();
        }
        socket.broadcast.to(roomId).emit('producerAudioOn', { 
            socketId: socket.id
        });
    });


    function getRoomId() { 
      return socket.roomId;
    }

    // When setup is complete, emit a 'connect-ack' event
    socket.emit('connect-ack', { type: 'finish', id: socket.id });
  });
}

export default setupMediasoupHandler;