import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import * as fs from 'fs'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

// NOTE: "products" is used for product cards/gallery images (local storage mode)
const ALLOWED_FOLDERS = new Set(['categories', 'promo', 'logos', 'blocks', 'products'])

function safeFolder(value: any) {
  const v = String(value || '').trim().toLowerCase()
  if (!ALLOWED_FOLDERS.has(v)) throw new BadRequestException('Некорректная папка загрузки')
  return v
}

function filenameWithUniq(originalName: string) {
  const ext = extname(originalName || '').toLowerCase() || '.bin'
  const ts = Date.now()
  const rnd = Math.random().toString(16).slice(2)
  return `${ts}-${rnd}${ext}`
}

@Controller('api/admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MediaController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, _file: any, cb: any) => {
          try {
            const folder = safeFolder((req as any).query?.folder)
            // ✅ Используем process.cwd(), чтобы путь не ломался после сборки (dist/)
            const uploadsDir = join(process.cwd(), 'uploads', 'static', folder)
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
            cb(null, uploadsDir)
          } catch (e: any) {
            cb(e, '')
          }
        },
        filename: (_req: any, file: any, cb: any) => cb(null, filenameWithUniq(file.originalname)),
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req: any, file: any, cb: any) => {
        const ok = /^image\//.test(file.mimetype || '')
        cb(ok ? null : new BadRequestException('Можно загрузить только изображение'), ok)
      },
    }),
  )
  uploadStatic(
    @Query('folder') folder: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Файл не получен')
    const safe = safeFolder(folder)
    // Важно: раздаётся через /uploads (см. ENABLE_LOCAL_UPLOADS=true)
    const url = `/uploads/static/${safe}/${file.filename}`
    return { ok: true, url }
  }
}
