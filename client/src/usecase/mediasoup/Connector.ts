import { io, Socket } from "socket.io-client";
import { Subscribe } from "./Subscribe";
import { JoinRequest } from "../../interface/Participant";
import { MediasoupError } from "./error";

// const host = "26.138.116.36";
// const port = 8000;
const namespace = "sfu";
const isUsingHttps = import.meta.env.VITE_USE_HTTPS && import.meta.env.VITE_USE_HTTPS === 'true';
let host_string = isUsingHttps ? import.meta.env.VITE_API_URL_HTTPS : import.meta.env.VITE_API_URL_HTTP;
if (!host_string) host_string = 'http://localhost:8000';

export const string_connection = `${host_string}/${namespace}`;

interface ConnectorEvents {
  onWaitingApproval?: () => void;
  onJoinRequest?: (request: JoinRequest) => void;
  onJoinRequestApproved?: () => void;
  onJoinRequestRejected?: () => void;
  onMemberJoined?: (member: {
    username: string,
    socketId: string,
    joinedAt: Date,
    isAudioMuted: boolean,
    isVideoMuted: boolean
  }) => void;
  onMemberLeft?: (socketId: string) => void;
  onHostChanged?: () => void;
  onNewProducer?: () => void;
  onSetStateParticipants?: () => void;
}

export class Connector {
  public socket: Socket;
  public socketId: string = '';
  public roomUrl: string;
  public subscribe!: Subscribe;
  public username: string;
  private events: ConnectorEvents = {};
  public role: 'host' | 'participant' = 'participant';

  constructor(url: string, username: string, events?: ConnectorEvents) {
    const opts = {
      path: '/socket',
      transports: ['websocket'],
    };
    this.username = username;
    this.socket = io(string_connection, opts);
    this.roomUrl = url;
    this.events = events || {};
  }

  setSubscribe(subscribe: Subscribe) {
      this.subscribe = subscribe;
  }

  disconnect() {
    this.socket.disconnect();
  }

  connectServer() {
    return new Promise((resolve: any, reject: any) => {

      this.socket.on('connect', () => {
        this.socketId = this.socket.id as string;
      })

      this.socket.on('disconnect', (evt: any) => {
        console.log('socket.io disconnect:', evt);
      });


      this.socket.on('member:left', async (data: {socketId: string, newHostId?: string}) => {
        await this.subscribe.handleParticipantLeaving(data.socketId);
        if (data.newHostId) {
          this.subscribe.setHostRole(data.newHostId);
          if (data.newHostId === this.socketId) {
            this.role = 'host';
          }
          // Notify UI that host has changed
          console.log('New host:', data.newHostId);
          this.events?.onHostChanged?.();
        }
        this.events?.onMemberLeft?.(data.socketId);
        console.log('Member left:', this.subscribe.participants);
      });

      
      this.socket.on('connect-ack', async (message: { type: string, id: any }) => {
        try {
          const response = await this.sendRequest('room:setup', {
            roomId: this.roomUrl,
            username: this.username
          });

          if (response.status === 'approved') {
            this.role = response.role;
            console.log('prepare room : ', this.roomUrl);
            console.log('role room : ', this.role);
          } else if (response.status === 'pending') {
            this.events?.onWaitingApproval?.();
            // Wait for join result
            this.socket.once('join:result', ({ approved }) => {
              if (approved) {
                console.log('Join request approved');
                this.events.onJoinRequestApproved?.();
                resolve(null);
              } else {
                console.log('Join request rejected');
                this.events.onJoinRequestRejected?.();
                this.socket.close();
                reject(MediasoupError.joinRequestRejected());
              }
            });
            return;
          }
        } catch (error: any) {
          if (error.type === 'exceed') {
            this.socket.close();
            reject(MediasoupError.roomFull());
          }
          if (error.type === 'empty') {
            this.socket.close();
            reject(MediasoupError.roomNotFound());
          }
          return;
        }

        if (message.type === 'finish') {
          if (this.socket.id !== message.id) {
            console.warn('WARN: socket-client != socket-server', this.socket.id, message.id);
          }

          console.log('connected to server. clientId=' + message.id);
          this.socketId = message.id;
          resolve(null);
        } else {
          console.error('UNKNOWN message from server:', message);
        }
      });

      // Host-specific event handlers
      this.socket.on('join:request', (request: JoinRequest) => {
        console.log("Received join request from", request.username);
        if (this.role === 'host') {
          // Show UI prompt to host - you might want to replace this with a more sophisticated UI
          console.log("Host received join request from", request.username);
          this.events.onJoinRequest?.({
            ...request,
            timestamp: Date.now()
          });
        }
      });


      this.socket.on('member:joined', async (member: {
        username: string,
        socketId: string, 
        joinedAt: Date,
        isAudioMuted: boolean,
        isVideoMuted: boolean
      }) => {
        console.log(`New member joined: ${member.username}`);
  
        // Only handle if subscribe is initialized and member is not self
        if (this.subscribe && member.socketId !== this.socketId) {
          console.log('Handling new member join:', member.username);
          await this.subscribe.handleNewMember(member);
        }
        
        this.events?.onMemberJoined?.(member);
      });

      // Existing event handlers...
      this.socket.on('newProducer', async (data: any) => {
        console.log('[client] newProducer:', data);
        const { socketId, producerId, kind, username }: any = data;
        console.log('--try consumeAdd remoteId=' + socketId + ', prdId=' + producerId + ', kind=' + kind);
        // await this.subscribe.consumeAdd(this.subscribe.consumerTransport, producerId, username, kind);
        await this.subscribe.consumeAdd(this.subscribe.consumerTransport, socketId, username, kind);
        console.log("New producer added");
        this.events?.onNewProducer?.();
      });

      

      this.socket.on('producerClosed', (data: any) => {
        console.log('[client] producerClosed:', data);
        const { produceId, clientId, kind } = data;
        console.log('--try removeConsumer remoteId=%s, localId=%s, track=%s', produceId, clientId, kind);
        this.subscribe.removeConsumer(produceId, kind);
        this.subscribe.removeRemoteVideo(produceId);
      });


      this.socket.on('producerAudioOff', (message: any) => {
          const socketId = message.socketId;
          
          this.subscribe.participants = this.subscribe.participants.map((uv) => {
              if(uv.socketId == socketId){
                  uv.audioOn = false;
              }
              return uv;
          });

          this.events?.onSetStateParticipants?.();
      });

      this.socket.on('producerAudioOn', (message: any) => {
          const socketId = message.socketId;
          
          this.subscribe.participants = this.subscribe.participants.map((uv) => {
              if(uv.socketId == socketId){
                  uv.audioOn = true;
              }
              return uv;
          });

          this.events?.onSetStateParticipants?.();
      });

      this.socket.on('producerVideoOff', (message: any) => {
          const socketId = message.socketId;
          
          this.subscribe.participants = this.subscribe.participants.map((uv) => {
              if(uv.socketId == socketId){
                  uv.videoOn = false;
              }
              return uv;
          });
          
          this.events?.onSetStateParticipants?.();
      });


      this.socket.on('producerVideoOn', (message: any) => {
          const socketId = message.socketId;
          
          this.subscribe.participants = this.subscribe.participants.map((uv) => {
              if(uv.socketId == socketId){
                  uv.videoOn = true;
              }
              return uv;
          });

          this.events?.onSetStateParticipants?.();
      });

    });
  }

  
  sendRequest(type: string, data: any): any {
    console.log('[sendRequest]', type);
    return new Promise((resolve, reject) => {
      this.socket.emit(type, data, (respond: any, err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(respond);
        }
      });
    });

  }
}
