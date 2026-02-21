import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston'
import * as winston from 'winston'
import { join } from 'path'

const logDir = join(process.cwd(), 'logs')

export const winstonConfig = WinstonModule.createLogger({
  transports: [
    // Console transport for development
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('SouvenirShop', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      level: 'error',
      filename: join(logDir, 'error.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      filename: join(logDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
})
