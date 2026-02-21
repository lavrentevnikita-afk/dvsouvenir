import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase()
    return this.usersRepository.findOne({ where: { email: normalized } })
  }

  async create(data: {
    name: string
    email: string
    passwordHash: string
  }): Promise<User> {
    const user = this.usersRepository.create(data)
    return this.usersRepository.save(user)
  }

  async updateMe(
    id: number,
    dto: Partial<Pick<User, 'name' | 'phone' | 'city' | 'address'>>,
  ): Promise<User> {
    await this.usersRepository.update({ id }, dto)
    const updated = await this.findById(id)
    // findById may return null only if the user was deleted; in our flow it's safe
    return updated as User
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.usersRepository.update({ id }, { passwordHash })
  }
}
