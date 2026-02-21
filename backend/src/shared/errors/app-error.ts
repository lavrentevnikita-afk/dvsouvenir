import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * Business-level error codes that the frontend can reliably map to UX.
 */
export enum AppErrorCode {
  CART_ITEM_UNAVAILABLE = 'CART_ITEM_UNAVAILABLE',
  ORDER_STATUS_CONFLICT = 'ORDER_STATUS_CONFLICT',
  FORBIDDEN_ROLE = 'FORBIDDEN_ROLE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export type AppErrorPayload = {
  code: AppErrorCode | string
  message: string
  details?: unknown
}

export class AppError extends HttpException {
  readonly code: string
  readonly details?: unknown

  constructor(payload: AppErrorPayload, status: number = HttpStatus.BAD_REQUEST) {
    super(
      {
        code: payload.code,
        message: payload.message,
        ...(typeof payload.details !== 'undefined' ? { details: payload.details } : {}),
      },
      status,
    )
    this.code = String(payload.code)
    this.details = payload.details
  }
}

export function throwAppError(
  code: AppErrorCode | string,
  message: string,
  details?: unknown,
  status: number = HttpStatus.BAD_REQUEST,
): never {
  throw new AppError({ code, message, details }, status)
}
