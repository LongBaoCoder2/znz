import meetingController from "@sfu/controllers/meeting.controller";
import { Router } from "express";

const path = "/meeting/";
const meetingRoute = Router();

meetingRoute.get(path, meetingController.sampleHandler);

export default meetingRoute;