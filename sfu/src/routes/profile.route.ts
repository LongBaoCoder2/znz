import profileController from "@sfu/controllers/profile.controller";
import { Router } from "express";

const path = "/profile/";
const profileRoute = Router();

profileRoute.get(path + "userid/:userId/", profileController.getProfileByUserIdHandler);
profileRoute.patch(path + "profileId/:profileId/lastlogin", profileController.updateLastLoginHandler);
profileRoute.patch(path + "/profileId/:profileId/displayname", profileController.updateDisplayNameHandler);

export default profileRoute;