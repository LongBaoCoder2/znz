import { Request, Response } from "express";
import { childLogger } from "@sfu/core/logger";
import { CreateMeetingDto } from "@sfu/dtos/meeting.dto";
import MeetingService from "@sfu/services/meeting.service";
import { title } from "process";

const sfuLogger = childLogger("sfu");

const meetingController = {
  createMeetingHandler: async (req: Request, res: Response) => {
    try {
        const meetingDto : CreateMeetingDto = req.body;
        const meetingService = new MeetingService();
        const id = 1;
        const username = "test";
        // const { id, username } = req.user;

        const { roomId, newMeeting } = await meetingService.createMeeting(id, username, meetingDto);
        res.status(201).json({
            roomId,
            title: newMeeting.title,
            displayId: newMeeting.displayId,
            uri: newMeeting.uri,
            host: newMeeting.host,
            createdAt: newMeeting.createdAt,
        });
    } catch (error: any) {
        sfuLogger.error("Error creating message: ", error);
        res.status(500).json({
            message: "Error when creating meeting.",
        });
    }
  }
};

export default meetingController;
