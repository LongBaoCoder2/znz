export interface SignInResponse {
  user: {
    id: number,
    username: string,
    email: string,
  },
  accessToken: string,
  refreshToken: string,
}

export interface SignUpResponse {
  data: {
    id: number,
    username: string,
  },
  status: number,
  message: string,
}

export interface CreateProfileResponse {
  id: number,
  displayName: string,
  avatarUrl: string,
  createdAt: any,
  lastLoginAt: any,
  userId: number,
}