import { CreateMeetingDto } from "@sfu/dtos/meeting.dto";
import { createMeeting, verifyMeetingPassword } from "@sfu/data-access/meetings";
import { getMeetingByDisplayId } from "@sfu/data-access/meetings";
import { generateMeetingID } from "@sfu/utils/crypt";
import { setupRoom } from "@sfu/utils/setupRoom";


class MeetingService {
  async createMeeting(hostId: number, hostName: string, meetingDto: CreateMeetingDto) {
    const { title, password } = meetingDto;

    const createTitle = title ? title : "New Meeting";
    const uri = generateMeetingID();
    try {
      const { roomId, room } = await setupRoom(createTitle, uri, hostId, password as string);
      const uriRoom = roomId;

      const displayId = generateMeetingID(uriRoom);
      const newMeeting = await createMeeting(createTitle, displayId, uriRoom, hostId, hostName, password);

      return { roomId, newMeeting };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async checkMeetingPassword(displayId: string, inputPassword?: string) {
    try {
      const meeting = await getMeetingByDisplayId(displayId);

      if (!meeting) {
        console.log(displayId);
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