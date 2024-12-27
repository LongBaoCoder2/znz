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
  id: number,
  username: string,
  email: string,
}