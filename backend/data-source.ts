import { DataSource } from 'typeorm'
import { config as dotenvConfig } from 'dotenv'
import { join } from 'path'

// Load environment variables
dotenvConfig()

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'souvenir',
  password: process.env.POSTGRES_PASSWORD || 'souvenir',
  database: process.env.POSTGRES_DB || 'souvenir',
  entities: [join(__dirname, 'src/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'src/migrations/*{.ts,.js}')],
  synchronize: true, // Временно true для создания таблиц
  logging: process.env.NODE_ENV !== 'production',
})
