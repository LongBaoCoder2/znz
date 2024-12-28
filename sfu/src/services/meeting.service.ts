import { CreateMeetingDto } from "@sfu/dtos/meeting.dto";
import { createMeeting } from "@sfu/data-access/meetings";
import { generateMeetingID } from "@sfu/utils/crypt";
import { setupRoom } from "@sfu/socket/room/room";

class MeetingService {
  async createMeeting(hostId: number, hostName: string, meetingDto: CreateMeetingDto) {
    const { title, displayId, password } = meetingDto;

    // Dev
    // const hostId = hostId;
    // const hostId = req.user.id;

    const createTitle = title ? title : "New Meeting";
    const uri = generateMeetingID();
    try {
      const newMeeting = await createMeeting(createTitle, displayId, uri, hostId, hostName, password);
      const passwordRoom = "";
      const { roomId, room } = await setupRoom(createTitle, newMeeting.uri, newMeeting.host, passwordRoom);

      return { roomId, newMeeting };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default MeetingService;
