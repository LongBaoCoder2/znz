import { Device, types as mediaSoupTypes } from "mediasoup-client";
import { Connector } from "./Connector";
import { Participant } from "../../interface/Participant";

interface AddConsumeUser {
  socketId: string;
  username: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}


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

      await this.consumeOtherProducers(this.connector.socketId);
      console.log("Participants: ", this.participants);

    } catch (error: any) {
      console.error('subscribe error: ', error);
    }
  }

  async leave() {
    try {
      this.videoConsumers.forEach((consumer) => {
        consumer.close();
      });
      this.audioConsumers.forEach((consumer) => {
        consumer.close();
      });

      // await this.connector.sendRequest('leave', { socketId: this.connector.socketId });
      this.consumerTransport.close();
      this.videoConsumers.clear();
      this.audioConsumers.clear();
      this.participants = [];
      console.log('You have successfully left the room.');
    } catch (error) {
      console.error('Error while leaving:', error);
    }
  }

  setHostRole(newHostId: string) {
    this.participants = this.participants.map((participant) => {
      if (participant.socketId === newHostId) {
        return { ...participant, role: 'host' };
      }
      return participant;
    });
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
      const videoConsumer = this.videoConsumers.get(leavingParticipant.socketId!);
      if (videoConsumer) {
        videoConsumer.close();
        console.log(`Removed video consumer for participant: ${socketId}`);
      }

      // Remove audio consumer
      const audioConsumer = this.audioConsumers.get(leavingParticipant.socketId!);
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

    videoIds.forEach(async (vid: any) => {
        const addConsumerUser : AddConsumeUser = {
            socketId: vid,
            username: Members[vid]?.username,
            isAudioMuted: Members[vid]?.isAudioMuted,
            isVideoMuted: Members[vid]?.isVideoMuted
        }
        await this.consumeAdd(this.consumerTransport, vid, addConsumerUser, 'video');
    });

    audioIds.forEach(async (aid: any) => {
        const addConsumerUser : AddConsumeUser = {
            socketId: aid,
            username: Members[aid]?.username,
            isAudioMuted: Members[aid]?.isAudioMuted,
            isVideoMuted: Members[aid]?.isVideoMuted
        }
        await this.consumeAdd(this.consumerTransport, aid, addConsumerUser, 'audio');
    });
    Object.values(Members).forEach(async (member: any) => {
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

  async handleNewMember(member: { username: string, 
                                  socketId: string, 
                                  joinedAt: Date, 
                                  isAudioMuted: boolean, 
                                  isVideoMuted: boolean }) {
    console.log('Handling new member join:', member.username, member.socketId);

    const participant : Participant = { username: member.username, 
                                        socketId: member.socketId, 
                                        videoOn: !member.isVideoMuted, 
                                        audioOn: !member.isAudioMuted,
                                        stream: new MediaStream()
                                      };
    this.addMember(participant);
    console.log('New member join handled successfully:', member.username);
  }

  async consumeAdd(consumerTransport: mediaSoupTypes.Transport, socketId: any, user: AddConsumeUser, tkind: string) {
      const { rtpCapabilities } = this.device;
      console.log("rtpCapabilities: ", rtpCapabilities);
      const data = await this.connector.sendRequest('consumeAdd', { rtpCapabilities: rtpCapabilities, producerId: socketId, kind: tkind })
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
      console.log("=========================================================");
      
      // this.addSubVideo(producerSocketId, consumer.track, kind, userName);
      // this.addConsumer(producerSocketId, consumer, kind);

      this.addSubVideo(socketId, consumer.track, kind, user);
      this.addConsumer(socketId, consumer, kind);

      console.log("=============== addSubVideo =====================");
      console.log('Consuming new producer: ', producerId, kind);
      consumer.on("producerclose" as any, () => {
          console.log('--consumer producer closed. remoteId=' + consumer.producerId);
          consumer.close();
          this.removeConsumer(producerId, kind);
          this.removeMember(socketId);
          // this.removeRemoteVideo(consumer.producerId);
      });


      if (kind === 'video') {
          console.log('--try resumeAdd --');
          this.connector.sendRequest('resumeAdd', { producerId: socketId, kind: kind })
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
      
      this.participants = this.participants.filter((participant) => participant.socketId !== id);
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
    async addSubVideo(socketId: any, track: any, kind: any, user: AddConsumeUser) {
        console.log("=============== addSubVideo =====================");
        
        let isExist = 0;
        
        this.participants =  this.participants.map((uv) => {

            if(uv.socketId == socketId){
                uv.stream?.addTrack(track);
                isExist = 1;
                // if (kind == 'audio') {
                //   uv.socketId = producerSocketId;
                // } else if (kind == 'video') {
                //   uv.socketId = producerSocketId;
                // }
            }
            return uv;
        })
        console.log("=============== addSubVideo sucessfully =====================");

        if(isExist == 0){
            console.log("=============== add new =====================");
            const newMedia = new MediaStream();
            newMedia.addTrack(track);
            // if(kind == 'audio'){
                this.participants = [...this.participants, {
                    socketId: socketId,
                    // audioProducerId: producerSocketId,
                    username: user.username,
                    stream: newMedia,
                    audioOn: !user.isAudioMuted,
                    videoOn: !user.isVideoMuted,
                }]
            // } else {
            //     this.participants = [...this.participants, {
            //         socketId: socketId,
            //         videoProducerId: producerSocketId,
            //         username: userName,
            //         stream: newMedia,
            //         audioOn: true,
            //         videoOn: true,
            //     }]
            // }
        }
    }
}