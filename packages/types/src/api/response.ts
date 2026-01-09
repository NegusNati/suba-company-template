export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
  nextCursor?: string;
}

export interface ApiLinks {
  self?: string;
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
  links?: ApiLinks;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: ValidationErrorDetail[];
    stack?: string;
  };
  meta: {
    timestamp: string;
    requestId?: string;
    path?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
