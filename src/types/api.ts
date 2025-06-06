export type ApiResponse<T = unknown> = {
  status: number;
  message?: string;
  data?: T;
  code?: string;
};
