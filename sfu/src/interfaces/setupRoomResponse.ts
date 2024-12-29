import { Room } from "@sfu/socket/room/room";

export interface SetupRoomResult {
  roomId: string;
  room: Room;
}