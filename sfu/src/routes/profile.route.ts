import profileController from "@sfu/controllers/profile.controller";
import { Router } from "express";
import upload from "@sfu/middlewares/filehandler";

const path = "/profile/";
const profileRoute = Router();

profileRoute.post(path, upload.single('avatar'), profileController.createProfileHandler);
profileRoute.get(path + "userid/:userId", profileController.getProfileByUserIdHandler);
profileRoute.patch(path + "profileId/:profileId/lastlogin", profileController.updateLastLoginHandler);
profileRoute.patch(path + "/profileId/:profileId/displayname", profileController.updateDisplayNameHandler);

export default profileRoute;