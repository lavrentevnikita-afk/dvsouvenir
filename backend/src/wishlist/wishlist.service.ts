import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { WishlistItem } from './wishlist.entity'
import { Product } from '../catalog/product.entity'

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishlistItem)
    private readonly wishlistRepo: Repository<WishlistItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async getAll(userId: number) {
    const items = await this.wishlistRepo.find({
      where: { userId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    })

    return items.map(item => ({
      id: item.id,
      productId: item.productId,
      product: item.product,
      createdAt: item.createdAt,
    }))
  }

  async add(userId: number, productId: number) {
    // Проверяем существование товара
    const product = await this.productRepo.findOne({ where: { id: productId } })
    if (!product) {
      throw new NotFoundException('Товар не найден')
    }

    // Проверяем, не добавлен ли уже
    const existing = await this.wishlistRepo.findOne({
      where: { userId, productId },
    })

    if (existing) {
      return { message: 'Товар уже в избранном', item: existing }
    }

    const item = this.wishlistRepo.create({ userId, productId })
    await this.wishlistRepo.save(item)

    return { message: 'Товар добавлен в избранное', item }
  }

  async remove(userId: number, productId: number) {
    const item = await this.wishlistRepo.findOne({
      where: { userId, productId },
    })

    if (!item) {
      throw new NotFoundException('Товар не найден в избранном')
    }

    await this.wishlistRepo.remove(item)

    return { message: 'Товар удален из избранного' }
  }

  async check(userId: number, productId: number): Promise<boolean> {
    const count = await this.wishlistRepo.count({
      where: { userId, productId },
    })
    return count > 0
  }

  async checkMultiple(userId: number, productIds: number[]): Promise<Record<number, boolean>> {
    const items = await this.wishlistRepo.find({
      where: { userId },
      select: ['productId'],
    })

    const wishlistSet = new Set(items.map(i => i.productId))
    const result: Record<number, boolean> = {}

    for (const id of productIds) {
      result[id] = wishlistSet.has(id)
    }

    return result
  }
}
