import profileController from "@sfu/controllers/profile.controller";
import { Router } from "express";
import upload from "@sfu/middlewares/filehandler";
import authMiddleware from "@sfu/middlewares/auth.middleware";
import { RequestWithUser } from "@sfu/interfaces/auth.interface";

const path = "/profile/";
const profileRoute = Router();

profileRoute.post(path, authMiddleware, profileController.createProfileHandler);
profileRoute.get(path, authMiddleware, profileController.getProfileByUserIdHandler);
profileRoute.patch(path + "avatar", authMiddleware, upload.single("avatar"), profileController.updateAvatarHandler);
profileRoute.patch(path, authMiddleware, profileController.updateProfileHandler);
profileRoute.patch(path, authMiddleware, profileController.updateProfileHandler);

export default profileRoute;
