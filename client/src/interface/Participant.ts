export interface Participant {
  username: string;
  videoProducerId?: string; 
  audioProducerId?: string; 
  socketId: string;
  videoOn: boolean;
  audioOn: boolean;
  stream?: MediaStream;
}

export interface JoinRequest {
  username: string;
  socketId: string;
  roomId: string;
  timestamp: number;
}