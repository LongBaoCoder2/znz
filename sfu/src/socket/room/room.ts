import { types as mediaSoupTypes } from 'mediasoup';
import { getNextWorker } from '../worker/worker'
import { createUUID } from '@sfu/utils/crypt';
import { MemberSFU } from '../types';
import { childLogger } from '@sfu/core/logger';
import { config } from '@sfu/core/config';


const sfuLogger = childLogger("sfu");

// Reference: https://github.com/DOWN-LEE/RT_Study/blob/main/server/src/socket/room/room.ts
export class Room {
  // Static room registry
  static rooms = new Map<string, Room>();

  id: string;
  name: string;
  url: string;
  createdAt: Date;
  password: string;
  hostId: number;
  hostSocketId?: string;


  // Members: socketId -> member
  members: Map<string, MemberSFU>;

  // Media management: socketId -> transport
  producerTransports: Map<string, mediaSoupTypes.WebRtcTransport>;
  consumerTransports: Map<string, mediaSoupTypes.WebRtcTransport>;
  
  // Streams: socketId -> producer
  videoProducers: Map<string, mediaSoupTypes.Producer>;
  audioProducers: Map<string, mediaSoupTypes.Producer>;

  // Consumer sets: clientId -> { remoteId -> consumer }
  videoConsumerSets: Map<string, Map<string, mediaSoupTypes.Consumer>>;
  audioConsumerSets: Map<string, Map<string, mediaSoupTypes.Consumer>>;

  // Producer user name mapping: producerId -> socketId (member)
  producerUserName: Map<string, string>;

  // Room settings
  maxParticipants: number;

  // Mediasoup router
  router: mediaSoupTypes.Router | null;
  // workerNum: number;

  constructor(options: {
      name: string;
      hostId: number;
      url: string;
      password: string;
      // workerIndex: number;
      maxParticipants?: number;
  }) {
      this.id = createUUID();
      this.name = options.name;
      this.hostId = options.hostId;
      this.createdAt = new Date();
      this.maxParticipants = options.maxParticipants || 20;
      this.password = options.password;
      this.url = options.url;
      // this.workerNum = options.workerIndex;

      // Initialize collections
      this.members = new Map();
      this.producerTransports = new Map();
      this.consumerTransports = new Map();
      this.videoProducers = new Map();
      this.audioProducers = new Map();
      this.videoConsumerSets = new Map();
      this.audioConsumerSets = new Map();
      this.producerUserName = new Map();  

      this.router = null;
  }

  getRtpCapabilities() {
    return this.router?.rtpCapabilities;
  }

  // Member management methods
  getMember(socketId: string) {
      return this.members.get(socketId);
  }

  // ================== Member management ==================
  addMember(member: MemberSFU) {
    if (this.members.size >= this.maxParticipants) {
      throw new Error('Room is full');
    }

    const status = this.members.size === 0 ? 'approved' : 'pending';
    const newMember = {
      ...member,
      joinedAt: new Date(),
      isAudioMuted: true,
      isVideoMuted: true,
      status: status as ('pending' | 'approved')
    };

    if (this.members.size === 0) {
      newMember.role = 'host';
      this.hostSocketId = member.socketId;
    } else {
      newMember.role = 'participant';
    }

    this.members.set(member.socketId, newMember);
    return newMember;
  }


  updateMemberStatus(socketId: string, status: 'approved' | 'rejected') {
    const member = this.members.get(socketId);
    if (member) {
      member.status = status;
      this.members.set(socketId, member);
    }
  }

  // ================== Host management ==================
  isHost(socketId: string): boolean {
    return socketId === this.hostSocketId;
  }

  transferHostRole(currentHostId: string, newHostId: string) {
    if (!this.isHost(currentHostId)) {
      throw new Error('Only current host can transfer host role');
    }

    const newHost = this.members.get(newHostId);
    if (newHost) {
      newHost.role = 'host';
      this.hostSocketId = newHostId;
      
      const oldHost = this.members.get(currentHostId);
      if (oldHost) {
        oldHost.role = 'participant';
      }
    }
  }

  removeMember(socketId: string) {
    this.members.delete(socketId);
      
    // Clean up associated producers
    // this.videoProducers.delete(socketId);
    // this.audioProducers.delete(socketId);
    // this.videoConsumerSets.delete(socketId);
    // this.audioConsumerSets.delete(socketId);
  }


  // Producer transport management methods
  getProducerTransport(id: string) { 
    return this.producerTransports.get(id);
  }

  addProducerTransport(id: string, transport: mediaSoupTypes.WebRtcTransport) {
    this.producerTransports.set(id, transport);
    sfuLogger.info(`Room[${this.id}]::addProducerTransport() count=${this.producerTransports.size}`);
  }

  removeProducerTransport(id: string) {
    this.producerTransports.delete(id);
    sfuLogger.info(`Room[${this.id}]::removeProducerTransport() count=${this.producerTransports.size}`);
  }

  // Producer management methods
  getAllRemoteProducerIds(clientId: string, kind: 'video' | 'audio') {
    let producerIds: string[] = [];

    if (kind === 'video') {
      for (const key of this.videoProducers.keys()) {
        if (key !== clientId) {
          producerIds.push(key);
        }
      }
    } else if (kind === 'audio') {
      for (const key of this.audioProducers.keys()) {
        if (key !== clientId) {
          producerIds.push(key);
        }
      }
    } else {
      sfuLogger.warn(`UNKNOWN producer kind=${kind}. Supported kinds are 'video' and 'audio'`);
    }

    return producerIds;
  }

  getProducer(id: string, kind: 'video' | 'audio') {
    if (kind === 'video') {
      return this.videoProducers.get(id);
    } else if (kind === 'audio') {
      return this.audioProducers.get(id);
    } else {
      sfuLogger.warn(`UNKNOWN producer kind=${kind}. Supported kinds are 'video' and 'audio'`);
      return null;
    }
  }

  addProducer(id: string, producer: mediaSoupTypes.Producer, kind: 'video' | 'audio') {
    if (kind === 'video') {
      this.videoProducers.set(id, producer);
      sfuLogger.info(`Room[${this.id}]::addProducer() video count=${this.videoProducers.size}`);
    } else if (kind === 'audio') {
      this.audioProducers.set(id, producer);
      sfuLogger.info(`Room[${this.id}]::addProducer() audio count=${this.audioProducers.size}`);
    } else {
      sfuLogger.warn(`UNKNOWN producer kind=${kind}. Supported kinds are 'video' and 'audio'`);
    }
  }

  removeProducer(id: string, kind: 'video' | 'audio') {
    if (kind === 'video') {
      this.videoProducers.delete(id);
      sfuLogger.info(`Room[${this.id}]::removeProducer() video count=${this.videoProducers.size}`);
    } else if (kind === 'audio') {
      this.audioProducers.delete(id);
      sfuLogger.info(`Room[${this.id}]::removeProducer() audio count=${this.audioProducers.size}`);
    } else {
      sfuLogger.warn(`UNKNOWN producer kind=${kind}. Supported kinds are 'video' and 'audio'`);
    }
  }


  // Consumer transport management methods
  getConsumerTransport(socketId: any) {
    return this.consumerTransports.get(socketId);
  }

  addConsumerTransport(socketId: any, transport: mediaSoupTypes.WebRtcTransport) {
    this.consumerTransports.set(socketId, transport);
    sfuLogger.info(`Room[${this.id}]::addConsumerTransport() count=${this.consumerTransports.size}`);
  }

  removeConsumerTransport(socketId: any) {
    this.consumerTransports.delete(socketId);
    sfuLogger.info(`Room[${this.id}]::removeConsumerTransport() count=${this.consumerTransports.size}`);
  }


  // Consumer set management methods
  getConsumerSet(clientId: string, kind: 'video' | 'audio') {
    if (kind === 'video') {
      return this.videoConsumerSets.get(clientId);
    } else if (kind === 'audio') {
      return this.audioConsumerSets.get(clientId);
    } else {
      sfuLogger.warn(`UNKNOWN consumer kind=${kind}. Supported kinds are 'video' and 'audio'`);
      return null;
    }
  }

  addConsumerSet(clientId: string, 
                 kind: 'video' | 'audio', 
                 set: Map<string, mediaSoupTypes.Consumer>) {
    if (kind === 'video') {
      this.videoConsumerSets.set(clientId, set);
      sfuLogger.info(`Room[${this.id}]::addConsumerSet() video count=${this.videoConsumerSets.size}`);
    } else if (kind === 'audio') {
      this.audioConsumerSets.set(clientId, set);
      sfuLogger.info(`Room[${this.id}]::addConsumerSet() audio count=${this.audioConsumerSets.size}`);
    } else {
      sfuLogger.warn(`UNKNOWN consumer kind=${kind}. Supported kinds are 'video' and 'audio'`);
    }
  }

  // Consumer management methods
  getConsumer(clientId: string, remoteId: string, kind: 'video' | 'audio') {
    const consumerSet = this.getConsumerSet(clientId, kind);
    if (consumerSet) {
      return consumerSet.get(remoteId);
    } else {
      return null;
    }
  }

  addConsumer(localId: any, remoteId: any, consumer: mediaSoupTypes.Consumer, kind: "video" | "audio") {
      const consumerSet = this.getConsumerSet(localId, kind);
      if (consumerSet) {
          consumerSet.set(remoteId, consumer);
          sfuLogger.info(`Room[${this.id}]::addConsumer() kind=${kind} count=${consumerSet.size}`);
      }
      else {
          sfuLogger.warn(`Room[${this.id}]::addConsumer() consumerSet not found. localId=${localId} kind=${kind}`);
          const newSet = new Map<string, mediaSoupTypes.Consumer>();
          newSet.set(remoteId, consumer);
          this.addConsumerSet(localId, kind, newSet);
          sfuLogger.info(`Room[${this.id}]::addConsumer() kind=${kind} count=${newSet.size}`);
      }
  }

  removeConsumer(localId: any, remoteId: any, kind: "video" | "audio") {
    const set = this.getConsumerSet(localId, kind);
    if (set) {
      set.delete(remoteId);
      sfuLogger.info(`Room[${this.id}]::removeConsumer() kind=${kind} count=${set.size}`);
    }
    else {
      sfuLogger.warn(`Room[${this.id}]::removeConsumer() consumerSet not found. localId=${localId} kind=${kind}`);
    }
  }


  // Remove all consumers associated with a client
  removeAllConsumersOfClient(clientId: string) {
    // Remove video consumers
    const videoConsumerSet = this.getConsumerSet(clientId, 'video');
    this.videoConsumerSets.delete(clientId);
    if (videoConsumerSet) {
      for (const key of videoConsumerSet.keys()) {
        videoConsumerSet.get(key)?.close();
        videoConsumerSet.delete(key);
      }
      sfuLogger.info(`Room[${this.id}]::removeConsumersOfClient() video count=${videoConsumerSet?.size}`);

    }

    // Remove audio consumers
    const audioConsumerSet = this.getConsumerSet(clientId, 'audio');
    this.audioConsumerSets.delete(clientId);
    if (audioConsumerSet) {
      for (const key of audioConsumerSet.keys()) {
        audioConsumerSet.get(key)?.close();
        audioConsumerSet.delete(key);
      }
      sfuLogger.info(`Room[${this.id}]::removeConsumersOfClient() audio count=${audioConsumerSet?.size}`);
    }
  }



  static addRoom(room: Room) {
    Room.rooms.set(room.id, room);
    console.log('static addRoom. name=%s', room.name);
  }

  static getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  static deleteRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
        this.rooms.delete(roomId);
    }
  }
}