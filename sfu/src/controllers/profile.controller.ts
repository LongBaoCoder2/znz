import { Request, Response } from "express";
import { childLogger } from "@sfu/core/logger";
import path from 'path';
import { readFileSync } from 'fs';
import ProfileService from "@sfu/services/profile.service";
import { ProfileDto } from "@sfu/dtos/profile.dto";
import { RequestWithUser } from "@sfu/interfaces/auth.interface";
import { updateProfile } from "@sfu/data-access/profile";

const sfuLogger = childLogger("sfu");

const profileController = {
  createProfileHandler: async (req: Request, res: Response) => {
    try {
      const userId = (req as RequestWithUser).user.id;
      const createProfileDto: ProfileDto = req.body;

      createProfileDto.avatarUrl = "assets/about-us.png";

      const profileService = new ProfileService();
      const newProfile = await profileService.createProfile(userId, createProfileDto);
      sfuLogger.info("newProfile------------: ", newProfile);
      res.status(201).json({
        message: "Profile created successfully.",
        data: newProfile,
      });
    } catch (error: any) {
      sfuLogger.error("Error creating profile: ", error);

      const statusCode = 500;
      const errorMessage = "Error creating profile.";

      res.status(statusCode).json({
        message: errorMessage,
      });
    }
  },

  getProfileByUserIdHandler: async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      sfuLogger.info("getProfileByUserIdHandler------------: ", req.user);
      const userId = (req as RequestWithUser).user.id;
      const profileService = new ProfileService();
      const profile = await profileService.getProfileByUserId(userId);

      sfuLogger.info("Profile------------: ", profile);

      if (profile && profile.avatarUrl) {
        const fileContent = readFileSync(profile.avatarUrl, 'base64');
        const profileWithAvatar = {
          ...profile,
          avatar: fileContent,
        }

        res.status(200).json({
          message: "Profile retrieved successfully.",
          data: profileWithAvatar,
        });
        return;
      }

      res.status(200).json({
        message: "Profile retrieved successfully.",
        data: profile,
      });

    } catch (error: any) {
      sfuLogger.error("Error retrieving profile: ", error);

      const statusCode = error.message === "Invalid userId." ? 400 : 500;
      const errorMessage = statusCode === 400
        ? "Invalid userId."
        : "Error getting profile.";

      res.status(statusCode).json({
        message: errorMessage,
      });
    }
  },

  updateAvatarHandler: async (req: Request, res: Response) => {
    try {
      const userId = (req as RequestWithUser).user.id;

      if (!req.files) {
        res.status(400).json({
          message: "Must have file!",
        });
        return;
      }

      const profileService = new ProfileService();

      const profile = profileService.getProfileByUserId(userId);
      if (!profile) {
        res.status(409).json({
          message: "Invalid userId!",
        });
        return;
      }

      if (req.file) {
        const avatarUrl = path.join("/uploads/", req.file.filename);


        await profileService.updateAvatarUrlByUserId(userId, avatarUrl);

        const fileContent = readFileSync(avatarUrl, 'base64');

        res.status(200).json({
          message: "Avatar updated successfully.",
          data: fileContent,
        });
      }
    } catch (error: any) {
      sfuLogger.error("Error updating avatar: ", error);

      const statusCode = 500;
      const errorMessage = "Error updating avatar.";

      res.status(statusCode).json({
        message: errorMessage,
      });
    }
  },

  updateProfileHandler: async (req: Request, res: Response) => {
    try {
      const userId = (req as RequestWithUser).user.id;

      const profileService = new ProfileService();
      const profile = await profileService.getProfileByUserId(userId);
      if (!profile) {
        res.status(409).json({
          message: "Invalid userId!",
        });
        return;
      }

      const profileId = profile.id;

      const newData = {
        displayName: req.body.displayName,
        fullname: req.body.fullName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
      };

      await updateProfile(profileId, newData);

      res.status(200).json({
        message: "Profile updated successfully.",
      });

    } catch (error: any) {
      sfuLogger.error("Error updating profile: ", error);

      const statusCode = 500;
      const errorMessage = "Error updating profile.";

      res.status(statusCode).json({
        message: errorMessage,
      });
    }
  },
};

export default profileController;