import { Request, Response } from "express";
import { childLogger } from "@sfu/core/logger";
import multer from 'multer';
import ProfileService from "@sfu/services/profile.service";
import { UpdateDisplayNameDto, CreateProfileDto } from "@sfu/dtos/profile.dto";

const sfuLogger = childLogger("sfu");

const profileController = {
  createProfileHandler: async (req: Request, res: Response) => {
    try {
      const createProfileDto : CreateProfileDto = req.body;

      // Handle avatarUrl if it was uploaded
      let avatarUrl: string | undefined;
      if (req.file) {
          // Assuming you're serving static files from the 'uploads' directory
          avatarUrl = `/uploads/${req.file.filename}`; // This is the relative URL
      }

      const profileService = new ProfileService();
      const newProfile = await profileService.createProfile(createProfileDto, avatarUrl);

      res.status(201).json({
          message: "Profile created successfully.",
          data: newProfile,
      });
    } catch (error: any) {
      sfuLogger.error("Error creating profile: ", error);

      const statusCode = (error.message === "Invalid userId.") ? 400 :
                        (error instanceof multer.MulterError) ? 415 : 500;

      const errorMessage = (statusCode === 415) ? "Only image files are allowed." :
                          (statusCode === 400) ? "Invalid userId." : "Error creating profile.";

      res.status(statusCode).json({
        message: errorMessage,
      });
    }
  },

    getProfileByUserIdHandler: async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.userId, 10);

            const profileService = new ProfileService();
            const profile = await profileService.getProfileByUserId(userId);

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

    updateLastLoginHandler: async (req: Request, res: Response) => {
        try {
            const profileId = parseInt(req.params.profileId, 10);

            const profileService = new ProfileService();
            await profileService.updateLastLogin(profileId);

            res.status(200).json({
                message: "Profile updated successfully.",
              });

        } catch (error: any) {
            sfuLogger.error("Error updating profile: ", error);

            const statusCode = error.message === "Invalid profileId." ? 400 : 500;
            const errorMessage = statusCode === 400
              ? "Invalid profileId."
              : "Error updating profile.";
      
            res.status(statusCode).json({
              message: errorMessage,
            });
        }
    },

    updateDisplayNameHandler: async (req: Request, res: Response) => {
        try {
            const profileId = parseInt(req.params.profileId, 10);
            const updateDisplayNameDto : UpdateDisplayNameDto = req.body;

            const profileService = new ProfileService();
            await profileService.updateDisplayName(profileId, updateDisplayNameDto);

            res.status(200).json({
                message: "Profile updated successfully.",
              });

        } catch (error: any) {
            sfuLogger.error("Error updating profile: ", error);

            const statusCode = error.message === "Invalid profileId." ? 400 : 500;
            const errorMessage = statusCode === 400
              ? "Invalid profileId."
              : "Error updating profile.";
      
            res.status(statusCode).json({
              message: errorMessage,
            });
        }
    },
};

export default profileController;