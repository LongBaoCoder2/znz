import { CreateMeetingDto } from "@sfu/dtos/meeting.dto";
import { createMeeting } from "@sfu/data-access/meetings";

class MeetingService {
  async createMeeting(meetingDto: CreateMeetingDto) {
    const { title, displayId, password, uri, hostId } = meetingDto;
    try {
      const newMeeting = await createMeeting(title, displayId, password, uri, hostId);
      
      return newMeeting;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
};

export default MeetingService;