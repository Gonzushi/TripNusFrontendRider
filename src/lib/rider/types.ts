export type UpdateDriverProfileResponse = {
  status: number;
  message?: string;
  code?: string;
  error?: string;
  data?: UpdateRiderProfileData;
};

export type UpdateRiderProfileData = {
  push_token?: string;
};