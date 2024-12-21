import { Socket } from "socket.io";

export type MemberSFU = {
    socketId: string;
    username: string;
    role?: 'host' | 'participant';
    joinedAt?: Date;
    isAudioMuted?: boolean;
    isVideoMuted?: boolean;
}

export interface RoomMember {
  role: 'host' | 'participant';
  username: string;
  socketId: string;
}

export interface RoomState {
  roomId: string;
  username: string;
  role: RoomMember['role'];
}

// Extend the Socket type with our custom properties
export interface EnhancedSocket extends Socket {
  roomState?: RoomState;
}



export enum RoomRole {
  HOST = 'host',
  PARTICIPANT = 'participant'
}

export interface RoomAccessCredentials {
  roomId: string;
  password: string;
}

export interface RoomJoinInfo {
  role: RoomRole;
  username: string;
  roomId: string;
  accessMethod: 'url' | 'credentials';
}

