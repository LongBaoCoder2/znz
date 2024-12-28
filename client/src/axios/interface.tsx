export interface SignInResponse {
  user: {
    id: number;
    username: string;
    email: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface SignUpResponse {
  data: {
    id: number;
    username: string;
  };
  status: number;
  message: string;
}

export interface CreateProfileResponse {
  data: {
    id: number;
    displayName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    createdAt: string;
    lastLoginAt: string;
    userId: number;
  };
  status: number;
  message: string;
}

export interface GetProfileResponse {
  data: {
    id: number;
    displayName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    createdAt: string;
    lastLoginAt: string;
    userId: number;
  };
  status: number;
  message: string;
}
