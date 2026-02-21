import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import { User } from '../users/user.entity'
import { Order } from '../orders/order.entity'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly frontendUrl: string

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'
  }

  /**
   * Отправка приветственного письма после регистрации
   */
  async sendWelcome(user: User): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Добро пожаловать в Suvlavka!',
        template: 'welcome',
        context: {
          name: user.name || 'Пользователь',
          email: user.email,
          frontendUrl: this.frontendUrl,
        },
      })
      this.logger.log(`Welcome email sent to ${user.email}`)
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}:`, error)
    }
  }

  /**
   * Уведомление о создании заказа
   */
  async sendOrderCreated(order: Order): Promise<void> {
    try {
      const items = (order.items || []).map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price).toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        total: (Number(item.price) * item.quantity).toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      }))

      await this.mailerService.sendMail({
        to: order.email,
        subject: `Заказ #${order.id} успешно создан`,
        template: 'order-created',
        context: {
          orderId: order.id,
          customerName: order.customerName,
          totalPrice: Number(order.totalPrice).toLocaleString('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          items,
          address: order.address,
          comment: order.comment,
        },
      })
      this.logger.log(`Order created email sent for order #${order.id}`)
    } catch (error) {
      this.logger.error(`Failed to send order created email for order #${order.id}:`, error)
    }
  }

  /**
   * Уведомление об изменении статуса заказа
   */
  async sendOrderStatusChanged(order: Order, oldStatus: string): Promise<void> {
    try {
      const statusNames: Record<string, string> = {
        new: 'Новый',
        processing: 'В обработке',
        ready: 'Готов к отгрузке',
        shipped: 'Отгружен',
        delivered: 'Доставлен',
        cancelled: 'Отменен',
      }

      await this.mailerService.sendMail({
        to: order.email,
        subject: `Заказ #${order.id}: статус изменен`,
        template: 'order-status-changed',
        context: {
          orderId: order.id,
          customerName: order.customerName,
          oldStatus: statusNames[oldStatus] || oldStatus,
          newStatus: statusNames[order.status] || order.status,
          statusClass: this.getStatusClass(order.status),
        },
      })
      this.logger.log(`Status change email sent for order #${order.id}`)
    } catch (error) {
      this.logger.error(`Failed to send status change email for order #${order.id}:`, error)
    }
  }

  /**
   * Отправка токена восстановления пароля
   */
  async sendPasswordReset(email: string, token: string, name?: string): Promise<void> {
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`

      await this.mailerService.sendMail({
        to: email,
        subject: 'Восстановление пароля',
        template: 'password-reset',
        context: {
          name: name || 'Пользователь',
          resetLink,
          expiresIn: '1 час',
        },
      })
      this.logger.log(`Password reset email sent to ${email}`)
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error)
    }
  }

  private getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      new: 'color: #2563eb;',
      processing: 'color: #d97706;',
      ready: 'color: #16a34a;',
      shipped: 'color: #9333ea;',
      delivered: 'color: #16a34a;',
      cancelled: 'color: #dc2626;',
    }
    return classes[status] || 'color: #64748b;'
  }
}
