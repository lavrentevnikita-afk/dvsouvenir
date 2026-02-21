import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
// ...existing code...
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto'
import { UpdateProfileDto, ChangePasswordDto } from '../users/dto/update-profile.dto'
import { User } from '../users/user.entity'
import { PasswordReset } from './entities/password-reset.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan } from 'typeorm'
import { randomBytes } from 'crypto'

interface JwtPayload {
  sub: number
  email: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  // ...existing code...
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
  ) {}

  private buildToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    }

    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, 
        phone: user.phone,
        city: user.city,
        address: user.address,
        createdAt: user.createdAt,
      },
    }
  }

  async register(dto: RegisterDto) {
    // Нормализуем email, чтобы логин/регистрация не ломались из-за регистра/пробелов
    const email = dto.email.trim().toLowerCase()

    const existing = await this.usersService.findByEmail(email)
    if (existing) {
      throw new BadRequestException('Пользователь с таким email уже существует')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)

    const user = await this.usersService.create({
      name: dto.name,
      email,
      passwordHash,
    })
// Отправляем приветственное письмо (асинхронно, не блокируя ответ)
// ...existing code...

    
    return this.buildToken(user)
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase()

    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    return this.buildToken(user)
  }

  async validateUserById(id: number): Promise<User | null> {
    return this.usersService.findById(id)
  }

  /**
   * Отправить токен восстановления пароля
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase()
    const user = await this.usersService.findByEmail(email)

    // Не раскрываем существование пользователя (защита от перебора)
    if (!user) {
      return { message: 'Если email существует, на него будет отправлена ссылка для восстановления пароля' }
    }

    // Генерируем токен
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 час

    // Сохраняем токен
    await this.passwordResetRepository.save({
      email,
      token,
      expiresAt,
      used: false,
    })

    // Отправляем email
  // ...existing code...

    return { message: 'Если email существует, на него будет отправлена ссылка для восстановления пароля' }
  }

  /**
   * Проверить токен восстановления
   */
  async verifyResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const reset = await this.passwordResetRepository.findOne({
      where: { token, used: false },
    })

    if (!reset) {
      return { valid: false }
    }

    if (reset.expiresAt < new Date()) {
      return { valid: false }
    }

    return { valid: true, email: reset.email }
  }

  /**
   * Сбросить пароль
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const reset = await this.passwordResetRepository.findOne({
      where: { token: dto.token, used: false },
    })

    if (!reset) {
      throw new BadRequestException('Недействительный или использованный токен')
    }

    if (reset.expiresAt < new Date()) {
      throw new BadRequestException('Срок действия токена истек')
    }

    const user = await this.usersService.findByEmail(reset.email)
    if (!user) {
      throw new BadRequestException('Пользователь не найден')
    }

    // Обновляем пароль
    const passwordHash = await bcrypt.hash(dto.newPassword, 10)
    await this.usersService.updatePassword(user.id, passwordHash)

    // Помечаем токен как использованный
    reset.used = true
    await this.passwordResetRepository.save(reset)

    return { message: 'Пароль успешно изменен' }
  }

  /**
   * Очистка истекших токенов (можно вызывать по cron)
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.passwordResetRepository.delete({
      expiresAt: LessThan(new Date()),
    })
  }

  /**
   * Обновить профиль пользователя
   */
  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден')
    }

    // Проверка уникальности email если он изменился
    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await this.usersService.findByEmail(dto.email)
      if (existingUser) {
        throw new ConflictException('Email уже используется другим пользователем')
      }
    }

    const updateData: any = {}
    if (dto.name) updateData.name = dto.name
    if (dto.email) updateData.email = dto.email.toLowerCase()
    if (dto.phone !== undefined) updateData.phone = dto.phone
    if (dto.city !== undefined) updateData.city = dto.city
    if (dto.address !== undefined) updateData.address = dto.address

    return this.usersService.updateMe(userId, updateData)
  }

  /**
   * Изменить пароль (требуется текущий пароль)
   */
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден')
    }

    // Проверяем текущий пароль
    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!isValid) {
      throw new BadRequestException('Неверный текущий пароль')
    }

    // Устанавливаем новый пароль
    const passwordHash = await bcrypt.hash(dto.newPassword, 10)
    await this.usersService.updatePassword(userId, passwordHash)

    return { message: 'Пароль успешно изменен' }
  }
}
