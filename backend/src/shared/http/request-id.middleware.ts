import { Injectable, NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'
import { randomUUID } from 'crypto'

/**
 * Adds requestId to every request for correlation across logs and error responses.
 * - Reads incoming X-Request-Id (if present)
 * - Otherwise generates a UUID
 * - Echoes it back in X-Request-Id header
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Local type extension to avoid relying on global Express module augmentation.
    // In some setups (ts-node/nodemon), .d.ts files might not be picked up consistently.
    type RequestWithId = Request & { requestId?: string }

    const incoming = (req.headers['x-request-id'] as string | undefined)?.trim()
    const requestId = incoming && incoming.length > 0 ? incoming : randomUUID()

    ;(req as RequestWithId).requestId = requestId
    res.setHeader('X-Request-Id', requestId)
    next()
  }
}
