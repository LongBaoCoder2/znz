import meetingController from "@sfu/controllers/meeting.controller";
import authMiddleware from "@sfu/middlewares/auth.middleware";
import { Router } from "express";

const path = "/meeting/";
const meetingRoute = Router();

meetingRoute.post(path, authMiddleware, meetingController.createMeetingHandler);
meetingRoute.post(path + "join", meetingController.joinMeetingHandler);


export default meetingRoute;
