import { Device, types as mediaSoupTypes } from "mediasoup-client";
import { Connector } from "./Connector";
import { Participant } from "../../interface/Participant";

export class Subscribe {
  public consumerTransport!: mediaSoupTypes.Transport;
  public videoConsumers = new Map<string, mediaSoupTypes.Consumer>();
  public audioConsumers = new Map<string, mediaSoupTypes.Consumer>();
  public device: Device;
  public connector: Connector;
  public participants: Participant[] = [];
  public mediaStreams: any = {};

  constructor(device: Device, connector: Connector) {
    this.device = device;
    this.connector = connector;
  }


  async subscribe() {
    try {
      const params = await this.connector.sendRequest('createConsumerTransport', {});
      this.consumerTransport = this.device.createRecvTransport(params);
      this.consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          console.log('--- consumer transport connect ---');
          this.connector.sendRequest('connectConsumerTransport', {
              dtlsParameters,
          }).then(callback).catch(errback);
      });


      this.consumerTransport.on('connectionstatechange', (state) => {
          switch (state) {
              case 'connecting':
                  console.log('subscribing...');
                  break;

              case 'connected':
                  console.log('subscribed');
                  break;

              case 'failed':
                  console.log('failed');
                  this.consumerTransport.close();
                  break;

              default:
                  console.log('connectionState:', state);
                  break;
          }
      });

      // await this.getAllOtherUsers(this.connector.socketId)
      await this.consumeOtherProducers(this.connector.socketId);

      

    } catch (error: any) {
      console.error('subscribe error: ', error);
    }
  }
  // async getAllOtherUsers(socketId: string) {
  //   try {
  //     const response = await this.connector.sendRequest('member:getAll', { socketId: socketId })
  //                             .catch((error: any) => {
  //                                 console.log('getAllOtherUsers error', error);
  //                                 return;
  //                             });
  //     console.log('getAllOtherUsers response:', response);
  //   } catch (error: any) {
  //     console.error('getAllOtherUsers error: ', error);
  //   }
  // }

  async leave() {
    try {
      this.videoConsumers.forEach((consumer) => {
        consumer.close();
      });
      this.audioConsumers.forEach((consumer) => {
        consumer.close();
      });

      await this.connector.sendRequest('leave', { socketId: this.connector.socketId });

      this.videoConsumers.clear();
      this.audioConsumers.clear();
      this.participants = [];
      console.log('You have successfully left the room.');
    } catch (error) {
      console.error('Error while leaving:', error);
    }
  }

  async handleParticipantLeaving(socketId: string) {
    try {
      console.log(`Handling participant leaving: ${socketId}`);

      const leavingParticipant = this.participants.find((p) => p.socketId === socketId);
      if (!leavingParticipant) {
        console.warn(`Participant with socketId ${socketId} not found.`);
        return;
      }
      this.participants = this.participants.filter((p) => p.socketId !== socketId);

      // Remove video consumer
      const videoConsumer = this.videoConsumers.get(leavingParticipant.videoProducerId!);
      if (videoConsumer) {
        videoConsumer.close();
        console.log(`Removed video consumer for participant: ${socketId}`);
      }

      // Remove audio consumer
      const audioConsumer = this.audioConsumers.get(leavingParticipant.audioProducerId!);
      if (audioConsumer) {
        audioConsumer.close();
        console.log(`Removed audio consumer for participant: ${socketId}`);
      }

      console.log(`Participant subscribe: ${this}`);
    } catch (error) {
      console.error(`Error handling participant leaving: ${socketId}`, error);
    }
  }



  async consumeOtherProducers(socketId: string) {
    const producers = await this.connector.sendRequest('getAllRemoteProducerIds', { localId: socketId })
            .catch((error: any) => {
                console.log('getOtherProducers error', error);
                return;
            });
    console.log('otherProducers', producers);
    


    const videoIds = producers.VideoIds;
    const audioIds = producers.AudioIds;

    const Members = producers.Members;
    console.log("Members: ", Members);

    videoIds.forEach(async (vid: any) => {
        await this.consumeAdd(this.consumerTransport, vid, Members[vid]?.username, Members[vid]?.socketId,'video');
    });

    console.log("consumeOtherProducers Members: ", Members);
    console.log("consumeOtherProducers videoIds: ", videoIds);
    audioIds.forEach(async (aid: any) => {
        await this.consumeAdd(this.consumerTransport, aid, Members[aid]?.username, Members[aid]?.socketId,'audio');
    });
    console.log("Object.values(Members): ", Object.values(Members));
    console.log("this.participants: ", this.participants);
    Object.values(Members).forEach(async (member: any) => {
      console.log("this.connector.socketId: ", this.connector.socketId);
      console.log("member.socketId: ", member.socketId);
      if (member.socketId !== this.connector.socketId) {
        let isExist = 0;
        this.participants.forEach((participant) => {
          if (participant.socketId === member.socketId) {
            isExist = 1;
          }
        });

        if (isExist === 0) {
          const newMember : Participant = {
              username: member.username,
              socketId: member.socketId,
              videoOn: !member.isVideoMuted,
              audioOn: !member.isAudioMuted,
              stream: new MediaStream()
          }

          this.participants = [...this.participants, newMember];
        }
      }
    });
  }
  
  addMember(member: Participant) {
    let isExist = 0;
    for (let i = 0; i < this.participants.length; i++) {
        if(this.participants[i].socketId == member.socketId){
            isExist = 1;
        }
    }

    if(isExist == 0){
        this.participants = [...this.participants, member];
    }

    return this.participants;
  }

  removeMember(socketId: string) {
    this.participants = this.participants.filter((participant) => participant.socketId !== socketId);
    return this.participants;
  }

  async handleNewMember(member: { username: string, socketId: string, joinedAt: Date }) {
    console.log('Handling new member join:', member.username);
    
    // Get producers for the new member using getAllRemoteProducerIds
    const producers = await this.connector.sendRequest('getAllRemoteProducerIds', { 
      localId: this.connector.socketId 
    }).catch((error: any) => {
      console.log('Failed to get producers for new member:', error);
      return null;
    });

    if (!producers) {
      console.log('No producers found for new member');
      return;
    }

    const { VideoIds, AudioIds, Members } = producers;
    console.log('Producers:', VideoIds, AudioIds, Members);

    const participant : Participant = { username: member.username, 
                                        socketId: member.socketId, 
                                        videoOn: false, 
                                        audioOn: false };
    this.addMember(participant);

    // Process video producers
    for (const producerId of VideoIds) {
      if (Members[producerId]?.username === member.username) {
        await this.consumeAdd(this.consumerTransport, producerId, member.username, member.socketId, 'video');
      }
    }

    // Process audio producers
    for (const producerId of AudioIds) {
      if (Members[producerId]?.username === member.username) {
        await this.consumeAdd(this.consumerTransport, producerId, member.username, member.socketId, 'audio');
      }
    }

    console.log('New member join handled successfully:', member.username);
  }

  async consumeAdd(consumerTransport: mediaSoupTypes.Transport, producerSocketId: any, userName: any, socketId: string, tkind: string) {
      const { rtpCapabilities } = this.device;
      console.log("rtpCapabilities: ", rtpCapabilities);
      const data = await this.connector.sendRequest('consumeAdd', { rtpCapabilities: rtpCapabilities, producerId: producerSocketId, kind: tkind })
          .catch((err: any) => {
              console.log('consumeAdd error', err);
          });

      console.log("ConsumAdd Data: ", data);

      const id = data.id;
      const producerId = data.producerId;
      const rtpParameters = data.rtpParameters;
      const kind = data.kind;

      const consumer = await consumerTransport.consume({
          id,
          producerId,
          kind,
          rtpParameters,
      });
      
      this.addSubVideo(producerSocketId, consumer.track, kind, userName, socketId);
      this.addConsumer(producerSocketId, consumer, kind);

      consumer.on("producerclose" as any, () => {
          console.log('--consumer producer closed. remoteId=' + consumer.producerId);
          consumer.close();
          this.removeConsumer(producerId, kind);
          this.removeMember(socketId);
          // this.removeRemoteVideo(consumer.producerId);
      });


      if (kind === 'video') {
          console.log('--try resumeAdd --');
          this.connector.sendRequest('resumeAdd', { producerId: producerSocketId, kind: kind })
              .then(() => {
                  console.log('resumeAdd OK');
              })
              .catch((err: any) => {
                  console.error('resumeAdd ERROR:', err);
              });
      }
  }


  removeRemoteVideo(id: string) {
      console.log(' ---- removeRemoteVideo() id=' + id);
      
      this.participants = this.participants.filter((participant) => participant.videoProducerId !== id);
  }

  removeConsumer(id: any, kind: any) {
      if (kind === 'video') {
          this.videoConsumers.delete(id);
          console.log('videoConsumers count=' + this.videoConsumers.size);
      }
      else if (kind === 'audio') {
          this.audioConsumers.delete(id);
          console.log('audioConsumers count=' + this.audioConsumers.size);
      }
      else {
          console.warn('UNKNOWN consumer kind=' + kind);
      }
  }



  addConsumer(producerSocketId: any, consumer: mediaSoupTypes.Consumer<mediaSoupTypes.AppData>, kind: any) {
    if (kind === 'video') {
        this.videoConsumers.set(producerSocketId, consumer);
        console.log('videoConsumers count=' + this.videoConsumers.size);
    }
    else if (kind === 'audio') {
        this.audioConsumers.set(producerSocketId, consumer);
        console.log('audioConsumers count=' + this.audioConsumers.size);
    }
    else {
        console.warn('UNKNOWN consumer kind=' + kind);
    }
  }

    // @ts-ignore
    async addSubVideo(producerSocketId: any, track: any, kind: any, userName: string, socketId: string) {
        
        let isExist = 0;
        
        this.participants =  this.participants.map((uv) => {
            // if(kind == 'audio' && uv.audioProducerId == producerSocketId){
            //     uv.stream?.addTrack(track);
            //     isExist = 1;
            // } else if (kind == 'video' && uv.videoProducerId == producerSocketId){
            //     uv.stream?.addTrack(track);
            //     isExist = 1;
            // }

            if(uv.socketId == socketId){
                uv.stream?.addTrack(track);
                isExist = 1;
                if (kind == 'audio') {
                  uv.audioProducerId = producerSocketId;
                } else if (kind == 'video') {
                  uv.videoProducerId = producerSocketId;
                }
            }
            return uv;
        })
        

        if(isExist == 0){
            const newMedia = new MediaStream();
            newMedia.addTrack(track);
            if(kind == 'audio'){
                this.participants = [...this.participants, {
                    socketId: socketId,
                    audioProducerId: producerSocketId,
                    username: userName,
                    stream: newMedia,
                    audioOn: true,
                    videoOn: true,
                }]
            } else {
                this.participants = [...this.participants, {
                    socketId: socketId,
                    videoProducerId: producerSocketId,
                    username: userName,
                    stream: newMedia,
                    audioOn: true,
                    videoOn: true,
                }]
            }
        }
    }
}