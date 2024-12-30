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


export interface UserStoreData {
  id: number;
  displayName: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  username: string;
  email: string;
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
    avatarBase64: string;
  };
  status: number;
  message: string;
}

export interface EditProfileResponse {
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
    avatarBase64: string;
  };
  status: number;
  message: string;
}

export interface EditAvatarResponse {
  data: {
  };
  status: number;
  message: string;
}

export interface JoinMeetingByIDResponse {
  data: {
    id: number;
    title: string;
    displayId: string;
    uri: string;
    host: number;
    createdAt: Date;
    status: string;
    hasCustomPassword: boolean;
  };
  status: number;
  message: string;
}