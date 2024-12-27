import { ProfileDto } from "@sfu/dtos/profile.dto";
import { createProfile, updateAvatarUrlByUserId, getProfileByUserId, updateLastLogin, updateProfile } from "@sfu/data-access/profile";
import { profile } from "@sfu/db/schemas/profile.schema";
import { childLogger } from "@sfu/core/logger";

const sfuLogger = childLogger("sfu");
class ProfileService {
    async createProfile(userId: number, createProfileDto: ProfileDto) {
        try {
            const { displayName, fullName, email, phoneNumber } = createProfileDto;

            sfuLogger.info(`createProfile------------: ${userId}, ${displayName}, ${fullName}, ${email}, ${phoneNumber}`);
            const profile = await createProfile(userId, displayName, fullName, email, phoneNumber);

            return profile;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getProfileByUserId(userId: number) {
        try {
            sfuLogger.info(`getProfileByUserId------------: ${userId}`);
            const profile = await getProfileByUserId(userId);
            sfuLogger.info(`getProfileByUserId profile------------: ${profile}`);

            return profile;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async updateAvatarUrlByUserId(userId: number, newAvatarUrl: string) {
        try {
            await updateAvatarUrlByUserId(userId, newAvatarUrl);
            return;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async updateProfile(profileId: number, profileData: Partial<typeof profile>) {
        try {
            if (isNaN(profileId)) {
                throw new Error("Invalid profileId.");
            }

            await updateProfile(profileId, profileData);

            return;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async updateLastLogin(profileId: number) {
        try {
            if (isNaN(profileId)) {
                throw new Error("Invalid profileId.");
            }

            await updateLastLogin(profileId);

            return;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
};

export default ProfileService;