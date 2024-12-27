import meetingController from "@sfu/controllers/meeting.controller";
import { Router } from "express";

const path = "/meeting/";
const meetingRoute = Router();

meetingRoute.post(path, meetingController.createMeetingHandler);
meetingRoute.post(path +"join", meetingController.createMeetingHandler);


export default meetingRoute;