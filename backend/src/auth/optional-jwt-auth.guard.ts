import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/**
 * Same as JwtAuthGuard but does not throw if there is no/invalid token.
 * Useful for endpoints that can work for guests but may enrich response for logged-in users.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleRequest(err: any, user: any, info: any, context: any) {
    return user || null
  }
}
