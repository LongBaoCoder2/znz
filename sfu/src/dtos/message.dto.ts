export interface SendMessageDto {
    meetingId: number;
    userId: number;
    content: string;
    toUser: number;
    isPinned: boolean;
}