import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './user.entity'

// Создаём сервисные аккаунты при запуске (dev-friendly)
@Injectable()
export class UsersBootstrapService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.ensureAllUsers()
  }

  private async ensureAllUsers() {
    const users = [
      { name: 'Евгений', email: 'evgeny@souvenir.local', role: 'admin', password: 'evgeny2026' },
      { name: 'Андрей', email: 'andrey@souvenir.local', role: 'admin', password: 'andrey2026' },
      { name: 'Никита', email: 'nikita@souvenir.local', role: 'admin', password: 'nikita2026' },
      { name: 'Виктор', email: 'viktor@souvenir.local', role: 'admin', password: 'viktor2026' },
      { name: 'Павел', email: 'pavel@souvenir.local', role: 'production', password: 'pavel2026' },
      { name: 'Екатерина', email: 'ekaterina@souvenir.local', role: 'production', password: 'ekaterina2026' },
      { name: 'Валентина', email: 'valentina@souvenir.local', role: 'manager', password: 'valentina2026' },
      { name: 'Биробиджансий Сувенир', email: 'birobidjan@souvenir.local', role: 'store', password: 'birobidjan2026' },
      { name: 'Хабаровский Сувенир (Центральный)', email: 'khabarovsk_central@souvenir.local', role: 'store', password: 'khabarovsk2026' },
      { name: 'Хабаровский Сувенир (Экодом)', email: 'khabarovsk_ekodom@souvenir.local', role: 'store', password: 'ekodom2026' },
    ]
    for (const u of users) {
      const existing = await this.userRepo.findOne({ where: { email: u.email } })
      if (existing) {
        if (existing.role !== u.role) {
          existing.role = u.role as User['role']
          await this.userRepo.save(existing)
        }
        continue
      }
      const passwordHash = await bcrypt.hash(u.password, 10)
      const user = this.userRepo.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role as User['role'],
      })
      await this.userRepo.save(user)
    }
  }
}
