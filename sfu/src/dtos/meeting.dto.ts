export interface CreateMeetingDto {
  title?: string;
  displayId: string;
  password?: string;
}

export interface JoinMeetingDto {
  meetingId: number;
  password?: string;
}