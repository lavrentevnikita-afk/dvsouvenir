import { Body, Controller, Logger, Post, Req } from '@nestjs/common'
import type { Request } from 'express'

@Controller('api/client-errors')
export class ClientErrorsController {
  private readonly logger = new Logger('ClientError')

  @Post()
  logClientError(
    @Req() req: Request,
    @Body()
    body: {
      message?: string
      stack?: string
      url?: string
      userAgent?: string
      requestId?: string
      context?: unknown
    },
  ) {
    const requestId = body?.requestId || (req as any).requestId
    this.logger.error(
      JSON.stringify({
        requestId,
        message: body?.message,
        url: body?.url,
        userAgent: body?.userAgent,
        context: body?.context,
        stack: body?.stack,
      }),
    )
    return { ok: true, requestId }
  }
}
