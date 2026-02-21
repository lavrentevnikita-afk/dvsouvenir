import { HttpStatus } from '@nestjs/common'

export type NormalizedErrorBody = {
  ok: false
  requestId?: string
  error: {
    code: string
    message: string
    details?: unknown
  }
}

const STATUS_TO_CODE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
}

export function normalizeHttpError(params: {
  status: number
  exceptionMessage: string
  responseBody: any
  requestId?: string
}): NormalizedErrorBody {
  const { status, exceptionMessage, responseBody, requestId } = params

  const message =
    typeof responseBody === 'string'
      ? responseBody
      : responseBody?.message && typeof responseBody.message === 'string'
        ? responseBody.message
        : Array.isArray(responseBody?.message)
          ? 'Validation failed'
          : exceptionMessage || 'Unexpected error'

  const details =
    typeof responseBody === 'object' && responseBody
      ? Array.isArray(responseBody.message)
        ? { validation: responseBody.message }
        : responseBody.details ?? undefined
      : undefined

  const code =
    typeof responseBody === 'object' && responseBody && typeof responseBody.code === 'string'
      ? responseBody.code
      : Array.isArray(responseBody?.message)
        ? 'VALIDATION_ERROR'
        : STATUS_TO_CODE[status] || 'ERROR'

  return {
    ok: false,
    requestId,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  }
}
