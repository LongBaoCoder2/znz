import { UpdateDisplayNameDto, CreateProfileDto } from "@sfu/dtos/profile.dto";
import { createProfile, getProfileById, updateLastLogin, updateDisplayName } from "@sfu/data-access/profile";

class ProfileService {
    async createProfile(createProfileDto: CreateProfileDto, avatarUrl: string | undefined) {
        try {
            const { userId, displayName} = createProfileDto;
            if (isNaN(userId)) {
                throw new Error("Invalid userId.");
            }

            const profile = await createProfile(userId, displayName, avatarUrl);

            return profile;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async getProfileByUserId(userId: number) {
        try {
            if (isNaN(userId)) {
                throw new Error("Invalid userId.");
            }

            const profile = await getProfileById(userId);

            return profile;
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

    async updateDisplayName(profileId: number, updateDisplayNameDto: UpdateDisplayNameDto) {
        try {
            const { newDisplayName } = updateDisplayNameDto;

            if (isNaN(profileId)) {
                throw new Error("Invalid profileId.");
            }

            await updateDisplayName(profileId, newDisplayName);

            return;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
};

export default ProfileService;