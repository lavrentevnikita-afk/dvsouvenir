import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../users/user.entity'
import { StoreProfile } from './store-profile.entity'
import { Product } from '../catalog/product.entity'
import { Stock } from './stock.entity'

/**
 * Небольшой bootstrap-хак, чтобы в dev/демо окружении можно было
 * быстро промотать конкретный аккаунт в магазин.
 *
 * Важно: если такого пользователя нет — ничего не делаем.
 */
@Injectable()
export class B2bBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(B2bBootstrapService.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(StoreProfile)
    private readonly storeRepo: Repository<StoreProfile>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Stock)
    private readonly stockRepo: Repository<Stock>,
  ) {}

  async onModuleInit() {
    const targetEmail = 'lavrentev.nikita.personal@gmail.com'
      .trim()
      .toLowerCase()

    try {
      const user = await this.userRepo.findOne({ where: { email: targetEmail } })
      if (!user) return

      // 1) роль store
      if (user.role !== 'store') {
        user.role = 'store'
        await this.userRepo.save(user)
        this.logger.log(`Promoted user ${targetEmail} to role=store`)
      }

      // 2) профиль магазина
      let profile = await this.storeRepo.findOne({
        where: { user: { id: user.id } },
      })

      if (!profile) {
        profile = this.storeRepo.create({
          user,
          status: 'active',
          companyName: 'Магазин Lavrentev',
          inn: null,
          kpp: null,
          ogrn: null,
          contacts: null,
          priceGroupId: null,
        })
        await this.storeRepo.save(profile)
        this.logger.log(`Created active store profile for ${targetEmail}`)
      } else if (profile.status !== 'active') {
        profile.status = 'active'
        profile.updatedAt = new Date()
        await this.storeRepo.save(profile)
        this.logger.log(`Activated store profile for ${targetEmail}`)
      }

      // Небольшой seed остатков (только если пусто и не production)
      if (process.env.NODE_ENV !== 'production') {
        const count = await this.stockRepo.count()
        if (count === 0) {
          const products = await this.productRepo.find()
          // Минимальный seed для разработки: заготовки + готовая продукция.
          const warehouses = ['BLANKS', 'FINISHED']

          for (const p of products) {
            for (const w of warehouses) {
              await this.stockRepo.save(
                this.stockRepo.create({
                  product: p,
                  warehouse: w,
                  qty: Math.floor(Math.random() * 50),
                })
              )
            }
          }
          this.logger.log(`Seeded stocks for ${products.length} products`)
        }
      }
    } catch (e: any) {
      this.logger.warn(`Bootstrap store promotion failed: ${e?.message ?? e}`)
    }
  }
}
