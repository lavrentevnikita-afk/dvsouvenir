import { Controller, Get } from '@nestjs/common'
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus'
import { SkipThrottle } from '@nestjs/throttler'

@Controller('health')
@SkipThrottle() // Health checks shouldn't be rate limited
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('live')
  @HealthCheck()
  checkLive() {
    // Liveness probe - just check if the app is running
    return this.health.check([])
  }

  @Get('ready')
  @HealthCheck()
  checkReady() {
    // Readiness probe - check if dependencies are available
    return this.health.check([
      () => this.db.pingCheck('database'),
    ])
  }
}
