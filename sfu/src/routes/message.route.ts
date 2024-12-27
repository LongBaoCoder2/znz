import messageController from "@sfu/controllers/message.controller";
import { Router } from "express";

const path = "/message/";
const messageRoute = Router();

messageRoute.post(path + "send", messageController.sendMesageHandler);
messageRoute.get(path + "meeting/:meetingId", messageController.getMeetingMessagesHandler);
messageRoute.put(path + ":messageId/pin", messageController.pinMessageHandler);
messageRoute.put(path + ":messageId/unpin", messageController.unpinMessageHandler);

export default messageRoute;
