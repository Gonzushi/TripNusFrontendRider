export type ApiResponse<T = unknown> = {
  status: number;
  code: string;
  message: string;
  data?: T;
  error?: string;
};
