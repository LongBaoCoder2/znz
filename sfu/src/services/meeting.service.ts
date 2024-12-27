import { CreateMeetingDto } from "@sfu/dtos/meeting.dto";
import { createMeeting, verifyMeetingPassword } from "@sfu/data-access/meetings";
import { generateMeetingID } from "@sfu/utils/crypt";
import { setupRoom } from "@sfu/socket/room/room";
import { getMeetingById } from "@sfu/data-access/meetings";


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

  async checkMeetingPassword(meetingId: number, inputPassword?: string) {
    try {
      const meeting = await getMeetingById(meetingId);

      if (!meeting) {
        throw new Error("Meeting not found");
      }

      // Kiểm tra xem meeting có password không
      if (meeting.hasCustomPassword) {
        if (!inputPassword) {
          return { requiresPassword: true };
        }

        // So sánh mật khẩu (hash và salt)
        const isPasswordValid = await verifyMeetingPassword(meeting.id, inputPassword);

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
      }

      return { requiresPassword: false, meeting };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};

export default MeetingService;