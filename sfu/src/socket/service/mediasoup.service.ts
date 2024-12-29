import { types as mediaSoupTypes } from "mediasoup";

import { Room } from "../room/room";
import { childLogger } from "@sfu/core/logger";
import { config } from "@sfu/core/config";
import { MemberSFU } from "../types";

const sfuLogger = childLogger("sfu");

export async function createWebRtcTransport(roomId: string){
  const webRtcTransportOptions = {
    ...config.mediasoup.webRtcTransport,
    listenIps: config.mediasoup.webRtcTransport.listenIps.map((ip) => ({
      ...ip,
    }))
  } as mediaSoupTypes.WebRtcTransportOptions;


  const room = Room.getRoomById(roomId);
  if(!room){
      sfuLogger.info(`createTransport() - there is no room: ${roomId}`);
      return;
  }

  const router = room.router;
  if(!router){
      sfuLogger.info(`createTransport() -there is no router ${roomId}`);
      return;
  }

  const newTransport: mediaSoupTypes.WebRtcTransport = await router.createWebRtcTransport(webRtcTransportOptions);

  return {
      transport: newTransport,
      params: {
          id: newTransport.id,
          iceParameters: newTransport.iceParameters,
          iceCandidates: newTransport.iceCandidates,
          dtlsParameters: newTransport.dtlsParameters
      }
  }
}


export const getRtpCapabilities = (roomId: string) => {
  const sfuLogger = childLogger("getRtpCapabilities");
  const room = Room.getRoomById(roomId);
  if (!room) {
    sfuLogger.info(`getRtpCapabilities(): there is no room - ${roomId}`);
    return;
  }

  if (!room.router) {
    sfuLogger.info(`getRtpCapabilities(): there is no router - ${roomId}`);
    return;
  }
  return room.getRtpCapabilities();
}


export const checkEmpty = (roomId: string) => {
    const room = Room.getRoomById(roomId);
    if(!room) {
      sfuLogger.info(`checkEmpty() - there is no room: ${roomId}`);
      return;
    }
    // if(Object.keys(room.members).length == 0){
    //     Room.deleteRoom(roomId);
    // }

    if (room.members.size === 0) {
      Room.deleteRoom(roomId);
    }
}


// -- Producer
export const getProducerTransport = (roomId: string, transportId: string) => {
  const room = Room.getRoomById(roomId);
  if(!room) 
  {
    sfuLogger.info(`getProducerTransport() - there is no room: ${roomId}`);
    return;
  }
  return room.getProducerTransport(transportId);
}


export const addProducerTransport = (roomId: string, transportId: string, transport: mediaSoupTypes.WebRtcTransport) => {
  const room = Room.getRoomById(roomId);
  if(!room) 
  {
    sfuLogger.info(`addProducerTransport() - there is no room: ${roomId}`);
    return;
  }
  room.addProducerTransport(transportId, transport);
}


export const removeProducerTransport = (roomId: string, transportId: string) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`removeProducerTransport() - there is no room: ${roomId}`);
    return;
  }
  room.removeProducerTransport(transportId);
}


export const getProducer = (roomId: string, producerId: string, kind: "video" | "audio") => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`getProducer() - there is no room: ${roomId}`);
    return;
  }
  return room.getProducer(producerId, kind);
}

export const addProducer = (roomId: string, producerId: string, producer: mediaSoupTypes.Producer, kind: "video" | "audio") => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`addProducer() - there is no room: ${roomId}`);
    return;
  }
  room.addProducer(producerId, producer, kind);
}


export const removeProducer = (roomId: string, producerId: string, kind: "video" | "audio") => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`removeProducer() - there is no room: ${roomId}`);
    return;
  }
  room.removeProducer(producerId, kind);
}


export const getAllRemoteProducerIds = (roomId: string, clientId: string, kind: "video" | "audio") => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`getOtherProducers() - there is no room: ${roomId}`);
    return;
  }
  return room.getAllRemoteProducerIds(clientId, kind);
}


// -- Consumer

export const getConsumerTransport = (roomId: string, socketId: string) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`getConsumerTransport() - there is no room: ${roomId}`);
    return;
  }
  return room.getConsumerTransport(socketId);
}

export const addConsumerTransport = (roomId: string, socketId: string, transport: mediaSoupTypes.WebRtcTransport) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`addConsumerTransport() - there is no room: ${roomId}`);
    return;
  }
  room.addConsumerTransport(socketId, transport);
}

export const removeConsumerTransport = (roomId: string, socketId: string) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`removeConsumerTransport() - there is no room: ${roomId}`);
    return;
  }
  room.removeConsumerTransport(socketId);
}

export const getConsumer = (roomId: string, clientId: string, remoteId: string, kind: "video" | "audio") => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`getConsumer() - there is no room: ${roomId}`);
    return;
  }
  return room.getConsumer(clientId, remoteId, kind);
}

export const addConsumer = (roomId: string, clientId: string, remoteId: string, consumer: mediaSoupTypes.Consumer, kind: "video" | "audio") => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`addConsumer() - there is no room: ${roomId}`);
    return;
  }
  room.addConsumer(clientId, remoteId, consumer, kind);
}

export const removeConsumer = (roomId: string, clientId: string, remoteId: string, kind: "video" | "audio") => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`removeConsumer() - there is no room: ${roomId}`);
    return;
  }
  room.removeConsumer(clientId, remoteId, kind);
}


// -- Create Consumer 
export const createConsumer = async (roomId: string, transport: mediaSoupTypes.Transport, producer: mediaSoupTypes.Producer ,rtpCapabilities: mediaSoupTypes.RtpCapabilities) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`createConsumer() - there is no room: ${roomId}`);
    return;
  }

  const router = room.router;
  if (!router) {
    sfuLogger.info(`createConsumer() - there is no router: ${roomId}`);
    return;
  }

  const canConsume = router.canConsume({
    producerId: producer.id,
    rtpCapabilities,
  })
  if (!canConsume) {
    sfuLogger.info(`createConsumer() - can't consume: ${roomId}`);
    return;
  }
  try {
    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: producer.kind === "video",
    });

    return {
      consumer,
      params: {
          producerId: producer.id,
          id: consumer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          type: consumer.type,
          producerPaused: consumer.producerPaused
      },
    };

  } catch (error: any) {
    sfuLogger.info(`createConsumer() - consume failed: ${error.message}`);
    return; 
  }
}


export const removeAllConsumersOfClient = (roomId: string, clientId: string) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`removeAllConsumersOfClient() - there is no room: ${roomId}`);
    return;
  }
  room.removeAllConsumersOfClient(clientId);
}

export const addMember = (roomId: string, member: MemberSFU) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`addMember() - there is no room: ${roomId}`);
    return;
  }
  room.addMember(member);
  sfuLogger.info("addMember Service: ", room.members);
}

export const transferHostRole = (roomId: string, currentHostId: string, newHostId: string) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`transferHostRole() - there is no room: ${roomId}`);
    return;
  }
  room.transferHostRole(currentHostId, newHostId);
}

export const transferHostDefault = (roomId: string, hostId: string) => {
  const room = Room.getRoomById(roomId);
  if (!room) {
    sfuLogger.info(`transferHostDefault() - there is no room: ${roomId}`);
    return;
  }

  if (room.members.size <= 1) {
    return;
  }

  const earliestMember = Array.from(room.members.values())
    .filter(member => member.socketId !== hostId)
    .sort((a, b) => b.joinedAt.getSeconds() - a.joinedAt.getSeconds())[0];

  let newHostId = undefined;
  if (earliestMember) {
    room.transferHostRole(hostId, earliestMember.socketId);
    newHostId = earliestMember.socketId;
  }

  return newHostId;
}


export const removeMember = (roomId: string, id: string) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`removeMember() - there is no room: ${roomId}`);
    return;
  }
  room.removeMember(id);
}

export const clearPeer = (roomId: string, socket: any) => {
  const clientId = socket.id;
  removeAllConsumersOfClient(roomId, clientId);

    const transport = getConsumerTransport(roomId, clientId);
    if (transport) {
      transport.close();
      removeConsumerTransport(roomId, clientId);
    }
  
    const videoProducer = getProducer(roomId, clientId, 'video');
    if (videoProducer) {
      videoProducer.close();
      removeProducer(roomId, clientId, 'video');
    }

    const audioProducer = getProducer(roomId, clientId, 'audio');
    if (audioProducer) {
      audioProducer.close();
      removeProducer(roomId, clientId, 'audio');
    }
  
    const producerTransport = getProducerTransport(roomId, clientId);
    if (producerTransport) {
      producerTransport.close();
      removeProducerTransport(roomId, clientId);
    }

    removeMember(roomId, clientId);

    checkEmpty(roomId);
}

export const isHost = (roomId: string, clientId: string) => {
  const room = Room.getRoomById(roomId);
  if(!room) {
    sfuLogger.info(`isHost() - there is no room: ${roomId}`);
    return;
  }
  return room.isHost(clientId);
}


export const getAllMembers = (roomId: string) => {
  const room = Room.getRoomById(roomId);
  return room?.members;
}

export const getRooms = () => {
  return Room.rooms;
}


export const getMemberSize = (roomId: string) => {
  const room = Room.getRoomById(roomId);
  return room?.members.size || 0;
}