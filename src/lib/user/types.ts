export type ProfileFormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type UpdateProfileResponse = {
  status: number;
  message?: string;
  data?: {
    first_name: string;
    last_name: string | null;
  };
};

export type UpdatePhoneResponse = {
  status: number;
  message?: string;
  data?: {
    phone: string;
  };
};

export type CreateRiderResponse = {
  status: number;
  message?: string;
  data: {
    id: string;
  };
};
