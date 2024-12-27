export interface CreateProfileDto {
    userId: number;
    displayName: string;
}

export interface UpdateDisplayNameDto {
    newDisplayName: string;
}