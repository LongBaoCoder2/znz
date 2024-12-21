export class SendMessageDto {
    public meetingId: number;
    public userId: number;
    public content: string;
    public toUser: number;
    public isPinned: boolean;
}