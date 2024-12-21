import messageController from "@sfu/controllers/message.controller";
import { Router } from "express";

const path = "/message/";
const messageRoute = Router();

messageRoute.post(path, messageController.sendMesageHandler);
messageRoute.get(path + "meeting/:meetingId", messageController.getMeetingMessages);
export default messageRoute;
