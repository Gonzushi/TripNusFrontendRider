export type UpdateDriverProfileResponse = {
  status: number;
  message?: string;
  code?: string;
  error?: string;
  data?: UpdateRiderProfileData;
};

export type UpdateRiderProfileData = {
  push_token?: string;
  first_name?: string;
  last_name?: string;
};

export type CreateRiderResponse = {
  status: number;
  message?: string;
  data: {
    id: string;
  };
  code: string;
};
