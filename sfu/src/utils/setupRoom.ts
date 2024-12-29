import { config } from "@sfu/core/config";
import { SetupRoomResult } from "@sfu/interfaces/setupRoomResponse";
import { Room } from "@sfu/socket/room/room";
import { getNextWorker } from "@sfu/socket/worker/worker";

export async function setupRoom(name: string, 
  url: string, 
  hostId: number, 
  password: string,
  maxParticipants?: number): Promise<SetupRoomResult> {

  const worker = getNextWorker();

  // Router media codecs.
  const { mediaCodecs } = config.mediasoup.router;

  const router = await worker.createRouter({ mediaCodecs });

  router.observer.on('close', () => {
    console.log('-- router closed. room=%s', name);
  });
  router.observer.on('newtransport', transport => {
    console.log('-- router newtransport. room=%s', name);
  });

  const room = new Room({name, url, hostId, maxParticipants, password });
  const roomId = room.id;

  room.router = router;
  Room.addRoom(room);
  return { roomId, room };
}