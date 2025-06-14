export type ProfileFormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export type UpdatePhoneResponse = {
  status: number;
  message?: string;
  data?: {
    phone: string;
  };
};