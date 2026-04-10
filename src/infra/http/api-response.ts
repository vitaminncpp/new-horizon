import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";

type ApiErrorBody = {
  error: string;
  code: string;
  details?: unknown;
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function apiError(error: unknown, fallbackStatus = 500) {
  if (error instanceof ZodError) {
    const body: ApiErrorBody = {
      error: "Validation failed",
      code: ErrorCode.VALIDATION_FAILED,
      details: error.flatten(),
    };

    return NextResponse.json(body, { status: 400 });
  }

  if (error instanceof Exception) {
    const body: ApiErrorBody = {
      error: error.message,
      code: error.code,
      details: error.data,
    };

    return NextResponse.json(body, { status: mapErrorCodeToStatus(error.code, fallbackStatus) });
  }

  const body: ApiErrorBody = {
    error: error instanceof Error ? error.message : "Internal Server Error",
    code: ErrorCode.INTERNAL_SERVER_ERROR,
  };

  return NextResponse.json(body, { status: fallbackStatus });
}

function mapErrorCodeToStatus(code: ErrorCode, fallbackStatus: number) {
  switch (code) {
    case ErrorCode.VALIDATION_FAILED:
    case ErrorCode.VALIDATION_NO_BODY:
    case ErrorCode.INVALID_PASSWORD:
    case ErrorCode.INVALID_TOKEN:
      return 400;
    case ErrorCode.UNAUTHORIZED:
      return 401;
    case ErrorCode.FORBIDDEN:
      return 403;
    case ErrorCode.DB_USER_NOT_FOUND:
    case ErrorCode.RESOURCE_NOT_FOUND:
      return 404;
    case ErrorCode.DB_USER_DUPLICATE:
    case ErrorCode.USERNAME_DUPLICATE:
      return 409;
    case ErrorCode.ENV_ERROR:
      return 500;
    default:
      return fallbackStatus;
  }
}
