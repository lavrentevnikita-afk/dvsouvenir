import { Injectable, Logger } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { extname } from 'path'

export type UploadInput = {
  buffer: Buffer
  mimetype?: string
  originalname?: string
  prefix?: string
}

@Injectable()
export class ObjectStorageService {
  private readonly logger = new Logger(ObjectStorageService.name)
  private readonly client: S3Client
  private readonly bucket: string
  private readonly publicBaseUrl: string

  constructor() {
    const endpoint = process.env.S3_ENDPOINT || 'https://storage.yandexcloud.net'
    const region = process.env.S3_REGION || 'ru-central1'
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

    this.bucket = process.env.S3_BUCKET || ''
    this.publicBaseUrl =
      process.env.S3_PUBLIC_BASE_URL || (this.bucket ? `https://storage.yandexcloud.net/${this.bucket}` : '')

    // IMPORTANT:
    // In some Docker/ISP environments, network calls to Object Storage can hang.
    // We set strict timeouts so requests fail fast with a clear error.
    const connectionTimeout = Number(process.env.S3_CONNECTION_TIMEOUT_MS || 5000)
    const socketTimeout = Number(process.env.S3_SOCKET_TIMEOUT_MS || 15000)
    const maxAttempts = Number(process.env.S3_MAX_ATTEMPTS || 2)

    this.client = new S3Client({
      region,
      endpoint,
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
      // Yandex Object Storage is S3-compatible and works well with path-style addressing
      forcePathStyle: true,
      maxAttempts,
      requestHandler: new NodeHttpHandler({
        connectionTimeout,
        socketTimeout,
      }),
    })
  }

  private safeKeyName(originalName?: string) {
    const name = (originalName || 'file').toLowerCase()
    const ext = extname(name) || ''
    const base = name
      .replace(ext, '')
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80)
    const stamp = Date.now()
    return `${stamp}-${base}${ext || '.bin'}`
  }

  async uploadPublic(input: UploadInput) {
    if (!this.bucket) throw new Error('S3_BUCKET is not set')
    if (!this.publicBaseUrl) throw new Error('S3_PUBLIC_BASE_URL is not set')

    const prefix = (input.prefix || 'products').replace(/^\/+|\/+$/g, '')
    const key = `${prefix}/${this.safeKeyName(input.originalname)}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimetype || 'application/octet-stream',
        CacheControl: 'public, max-age=31536000',
      }),
    )

    const url = `${this.publicBaseUrl.replace(/\/+$/g, '')}/${key}`
    this.logger.log(`Uploaded to Object Storage: ${url}`)
    return { key, url }
  }
}
