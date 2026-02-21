import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { DataSource } from 'typeorm'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'

// Очень опасная зона: просмотр/редактирование БД.
// Только admin. Таблицы строго по allowlist.

type TableConfig = {
  pk: string
  // null => берём колонки из information_schema, но всё равно фильтруем системные
  editable?: string[] | null
}

const ALLOWED_TABLES: Record<string, TableConfig> = {
  users: { pk: 'id', editable: ['name', 'email', 'phone', 'role', 'city', 'address'] },
  categories: { pk: 'id', editable: ['slug', 'name', 'description'] },
  products: { pk: 'id', editable: ['slug', 'name', 'article', 'description', 'specs', 'price', 'weight', 'city', 'is_available', 'popularity', 'categoryId'] },
  product_images: { pk: 'id', editable: ['url', 'sortOrder', 'productId'] },
  orders: { pk: 'id', editable: ['status', 'total', 'userId', 'city', 'address', 'comment'] },
  order_items: { pk: 'id', editable: ['orderId', 'productId', 'qty', 'price'] },
  stocks: { pk: 'id', editable: ['productId', 'warehouse', 'qty'] },
  store_profiles: { pk: 'id', editable: ['companyName', 'displayName', 'logoUrl', 'address', 'city', 'phone', 'website', 'inn', 'kpp', 'ogrn', 'contacts', 'priceGroupId', 'status', 'userId'] },
}

function assertAllowedTable(name: string) {
  const table = String(name || '').toLowerCase()
  if (!ALLOWED_TABLES[table]) {
    throw new BadRequestException('Таблица недоступна')
  }
  return table
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('/api/admin/db')
export class AdminDbController {
  constructor(private readonly ds: DataSource) {}

  @Get('tables')
  listTables() {
    return {
      tables: Object.keys(ALLOWED_TABLES).sort(),
    }
  }

  @Get('table/:name')
  async getTable(
    @Param('name') name: string,
    @Query('limit') limitRaw?: string,
    @Query('offset') offsetRaw?: string,
  ) {
    const table = assertAllowedTable(name)
    const limit = Math.min(Math.max(parseInt(limitRaw || '50', 10) || 50, 1), 200)
    const offset = Math.max(parseInt(offsetRaw || '0', 10) || 0, 0)

    const [{ count }] = await this.ds.query(
      `SELECT COUNT(*)::int AS count FROM "${table}"`,
    )

    const rows = await this.ds.query(
      `SELECT * FROM "${table}" ORDER BY 1 DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    )

    const columnsRes = await this.ds.query(
      `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
      `,
      [table],
    )
    const columns = columnsRes.map((r: any) => r.column_name)

    return { table, columns, count, limit, offset, rows }
  }

  @Patch('table/:name/:id')
  async updateRow(
    @Param('name') name: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const table = assertAllowedTable(name)
    const cfg = ALLOWED_TABLES[table]

    const confirm = String(body?.confirm || '')
    // Двойная защита от случайного редактирования
    if (confirm !== 'YES_I_AM_SURE') {
      throw new BadRequestException('Подтверждение отсутствует (confirm=YES_I_AM_SURE)')
    }

    const data = body?.data
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Некорректные данные')
    }

    // фильтруем поля строго по allowlist
    const editable = cfg.editable || []
    const toSet: Record<string, any> = {}
    for (const k of Object.keys(data)) {
      if (editable.includes(k)) {
        toSet[k] = data[k]
      }
    }
    if (!Object.keys(toSet).length) {
      throw new BadRequestException('Нет разрешённых полей для обновления')
    }

    // строим безопасный UPDATE
    const keys = Object.keys(toSet)
    const setSql = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ')
    const params = [...keys.map((k) => toSet[k]), id]
    const pk = cfg.pk

    await this.ds.query(
      `UPDATE "${table}" SET ${setSql} WHERE "${pk}" = $${keys.length + 1}`,
      params,
    )

    const [row] = await this.ds.query(
      `SELECT * FROM "${table}" WHERE "${pk}" = $1`,
      [id],
    )
    return { ok: true, row }
  }

  @Delete('table/:name/:id')
  async deleteRow(
    @Param('name') name: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const table = assertAllowedTable(name)
    const cfg = ALLOWED_TABLES[table]

    const confirm = String(body?.confirm || '')
    // отдельное подтверждение для удаления
    if (confirm !== 'YES_DELETE') {
      throw new BadRequestException('Подтверждение отсутствует (confirm=YES_DELETE)')
    }

    const pk = cfg.pk
    await this.ds.query(`DELETE FROM "${table}" WHERE "${pk}" = $1`, [id])
    return { ok: true }
  }
}
