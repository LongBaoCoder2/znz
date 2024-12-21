import { Request, Response } from "express";
import { childLogger } from "@sfu/utils/logger";
import { CreateMeetingDto } from "@sfu/dtos/meeting.dto";
import MeetingService from "@sfu/services/meeting.service";

const sfuLogger = childLogger("sfu");

const meetingController = {
  createMeetingHandler: async (req: Request, res: Response) => {
    try {
        const meetingDto : CreateMeetingDto = req.body;
        const meetingService = new MeetingService();

        const newMeeting = await meetingService.createMeeting(meetingDto);
        res.status(201).send("Meeting created successfully.");
    } catch (error: any) {
        sfuLogger.error("Error creating message: ", error);
        res.status(500).json({
            message: "Error when creating meeting.",
        });
    }
  }
};

export default meetingController;
