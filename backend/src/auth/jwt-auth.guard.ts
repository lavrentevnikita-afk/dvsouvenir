import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

// Guard на базе passport-jwt стратегии (JwtStrategy)
// JwtStrategy.validate() должен возвращать объект, который попадёт в req.user
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
