export interface CreateMeetingDto {
  title?: string;
  password?: string;
}

export interface JoinMeetingDto {
  displayId: string;
  password?: string;
}