import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PromoBanner } from './promo-banner.entity'
import { CreatePromoBannerDto, UpdatePromoBannerDto } from './dto'

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(PromoBanner)
    private readonly promoRepo: Repository<PromoBanner>,
  ) {}

  // Public
  async listActivePromoBanners() {
    const now = new Date()
    // Active + within schedule window if specified.
    const items = await this.promoRepo
      .createQueryBuilder('b')
      .where('b.isActive = true')
      .andWhere('(b.startAt IS NULL OR b.startAt <= :now)', { now })
      .andWhere('(b.endAt IS NULL OR b.endAt >= :now)', { now })
      .orderBy('b.sortOrder', 'ASC')
      .addOrderBy('b.id', 'DESC')
      .getMany()
    return { banners: items }
  }

  // Admin
  async adminListPromoBanners() {
    const items = await this.promoRepo.find({
      order: { sortOrder: 'ASC', id: 'DESC' },
    })
    return { banners: items }
  }

  async createPromoBanner(dto: CreatePromoBannerDto) {
    const created = this.promoRepo.create({
      title: dto.title?.trim() || '',
      type: (dto.type || 'banner').trim(),
      text: dto.text ? String(dto.text) : null,
      imageUrl: String(dto.imageUrl || '').trim(),
      linkUrl: String(dto.linkUrl || '').trim(),
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      startAt: dto.startAt ? new Date(dto.startAt) : null,
      endAt: dto.endAt ? new Date(dto.endAt) : null,
    })
    const saved = await this.promoRepo.save(created)
    return { banner: saved }
  }

  async updatePromoBanner(id: number, dto: UpdatePromoBannerDto) {
    const banner = await this.promoRepo.findOne({ where: { id } })
    if (!banner) throw new NotFoundException('Баннер не найден')

    if (dto.title !== undefined) banner.title = String(dto.title || '').trim()
    if (dto.type !== undefined) banner.type = String(dto.type || 'banner').trim()
    if (dto.text !== undefined) banner.text = dto.text ? String(dto.text) : null
    if (dto.imageUrl !== undefined) banner.imageUrl = String(dto.imageUrl || '').trim()
    if (dto.linkUrl !== undefined) banner.linkUrl = String(dto.linkUrl || '').trim()
    if (dto.sortOrder !== undefined) banner.sortOrder = dto.sortOrder as any
    if (dto.isActive !== undefined) banner.isActive = dto.isActive as any
    if (dto.startAt !== undefined) banner.startAt = dto.startAt ? new Date(dto.startAt) : null
    if (dto.endAt !== undefined) banner.endAt = dto.endAt ? new Date(dto.endAt) : null

    const saved = await this.promoRepo.save(banner)
    return { banner: saved }
  }

  async deletePromoBanner(id: number) {
    const banner = await this.promoRepo.findOne({ where: { id } })
    if (!banner) throw new NotFoundException('Баннер не найден')
    await this.promoRepo.remove(banner)
    return { ok: true }
  }
}
