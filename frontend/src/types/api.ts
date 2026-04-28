export interface ApiResponse<T> {
  data: T;
  status?: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}
