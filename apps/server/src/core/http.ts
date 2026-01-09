import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ValidationErrorDetail,
} from "@suba-company-template/types/api";
import { ErrorCodes } from "@suba-company-template/types/api";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import type { ZodIssue } from "zod";

import { logger } from "../shared/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: ValidationErrorDetail[],
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, ErrorCodes.NOT_FOUND, message);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    details?: ValidationErrorDetail[],
  ) {
    super(400, ErrorCodes.VALIDATION_ERROR, message, details);
  }
}

export const formatZodIssues = (issues: ZodIssue[]): ValidationErrorDetail[] =>
  issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "root",
    message: issue.message,
    value: "input" in issue ? (issue as { input?: unknown }).input : undefined,
  }));

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(401, ErrorCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(403, ErrorCodes.FORBIDDEN, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(409, ErrorCodes.CONFLICT, message);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too many requests") {
    super(429, ErrorCodes.BAD_REQUEST, message);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "Payload too large") {
    super(413, ErrorCodes.BAD_REQUEST, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(400, ErrorCodes.BAD_REQUEST, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(500, ErrorCodes.INTERNAL_ERROR, message);
  }
}

export const successResponse = <T>(
  c: Context,
  data: T,
  statusCode?: number,
): Response => {
  const requestId = c.get("requestId");
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
  // @ts-expect-error Hono's type inference is too strict for dynamic status codes
  return c.json(response, statusCode ?? 200);
};

export const paginatedResponse = <T>(
  c: Context,
  data: T,
  pagination: {
    page: number;
    limit: number;
    total?: number;
    nextCursor?: string;
  },
  statusCode?: number,
): Response => {
  const requestId = c.get("requestId");
  const totalPages =
    pagination.total !== undefined
      ? Math.ceil(pagination.total / pagination.limit)
      : undefined;
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
      pagination: {
        ...pagination,
        ...(totalPages !== undefined && { totalPages }),
      },
    },
  };
  // @ts-expect-error Hono's type inference is too strict for dynamic status codes
  return c.json(response, statusCode ?? 200);
};

export const errorResponse = (
  c: Context,
  code: string,
  message: string,
  statusCode: number,
  details?: ValidationErrorDetail[],
): Response => {
  const requestId = c.get("requestId");
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      statusCode,
      details,
      stack:
        process.env.NODE_ENV === "development" ? new Error().stack : undefined,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
      path: c.req.path,
    },
  };
  // @ts-expect-error Hono's type inference is too strict for dynamic status codes
  return c.json(response, statusCode);
};

export const handleError = (error: unknown, c: Context) => {
  if (error instanceof AppError) {
    return errorResponse(
      c,
      error.code,
      error.message,
      error.statusCode,
      error.details,
    );
  }

  if (error instanceof ZodError) {
    const details = formatZodIssues(error.issues);
    return errorResponse(
      c,
      ErrorCodes.VALIDATION_ERROR,
      "Validation failed",
      400,
      details,
    );
  }

  if (error instanceof HTTPException) {
    return errorResponse(
      c,
      ErrorCodes.INTERNAL_ERROR,
      error.message,
      error.status,
    );
  }

  const requestId = c.get("requestId");
  logger.error("Unexpected error", error as Error, {
    requestId,
    path: c.req.path,
    method: c.req.method,
  });

  return errorResponse(
    c,
    ErrorCodes.INTERNAL_ERROR,
    "Internal server error",
    500,
  );
};
