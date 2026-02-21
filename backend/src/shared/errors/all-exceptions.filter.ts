import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { normalizeHttpError } from './http-error.util'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpException')

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest<Request>()
    const res = ctx.getResponse<Response>()
    const requestId = (req as any).requestId

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let responseBody: any = undefined
    let message = 'Unexpected error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      responseBody = exception.getResponse()
      message = exception.message
    } else if (exception instanceof Error) {
      message = exception.message
    }

    const normalized = normalizeHttpError({
      status,
      exceptionMessage: message,
      responseBody,
      requestId,
    })

    const logPayload = {
      requestId,
      method: req.method,
      url: (req as any).originalUrl || req.url,
      status,
      error: normalized.error,
      stack: exception instanceof Error ? exception.stack : undefined,
    }

    if (status >= 500) this.logger.error(JSON.stringify(logPayload))
    else this.logger.warn(JSON.stringify(logPayload))

    res.status(status).json(normalized)
  }
}
