import { Injectable } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import { Order } from '../orders/order.entity'

@Injectable()
export class PdfService {
  /**
   * Generate invoice PDF for an order
   */
  async generateInvoice(order: Order): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 })
        const chunks: Buffer[] = []

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        // Header
        doc
          .fontSize(20)
          .text('СЧЕТ', { align: 'center' })
          .moveDown()

        // Invoice details
        doc.fontSize(12).text(`Счет №: ${order.id}`, { align: 'left' })
        doc.text(`Дата: ${new Date(order.createdAt).toLocaleDateString('ru-RU')}`)
        doc.text(`Статус: ${this.translateStatus(order.status)}`)
        doc.moveDown()

        // Customer info
        doc.fontSize(14).text('Покупатель:', { underline: true })
        doc.fontSize(11)
        doc.text(`Имя: ${order.customerName}`)
        doc.text(`Email: ${order.email}`)
        if (order.phone) doc.text(`Телефон: ${order.phone}`)
        doc.text(`Адрес: ${order.address}`)
        if (order.comment) doc.text(`Комментарий: ${order.comment}`)
        doc.moveDown()

        // Items table header
        doc.fontSize(12).text('Товары:', { underline: true })
        doc.moveDown(0.5)

        const tableTop = doc.y
        const itemX = 50
        const qtyX = 320
        const priceX = 400
        const totalX = 480

        // Table headers
        doc.fontSize(10).font('Helvetica-Bold')
        doc.text('Наименование', itemX, tableTop)
        doc.text('Кол-во', qtyX, tableTop)
        doc.text('Цена', priceX, tableTop)
        doc.text('Сумма', totalX, tableTop)
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke()

        // Items
        doc.font('Helvetica')
        let currentY = tableTop + 25
        const items = order.items || []

        for (const item of items) {
          if (currentY > 700) {
            doc.addPage()
            currentY = 50
          }

          const itemName = item.name || `Товар #${item.productId}`
          const qty = item.quantity || 0
          const price = Number(item.price || 0)
          const total = qty * price

          doc.fontSize(9)
          doc.text(itemName, itemX, currentY, { width: 260, ellipsis: true })
          doc.text(qty.toString(), qtyX, currentY)
          doc.text(this.formatMoney(price), priceX, currentY)
          doc.text(this.formatMoney(total), totalX, currentY)

          currentY += 20
        }

        // Total line
        doc.moveTo(50, currentY).lineTo(550, currentY).stroke()
        currentY += 10

        // Discount (if applicable)
        const totalPrice = Number(order.totalPrice || 0)
        if (order.discountPercent && order.discountPercent > 0) {
          const subtotal = totalPrice / (1 - order.discountPercent / 100)
          const discount = subtotal - totalPrice

          doc.fontSize(11)
          doc.text('Промежуточный итог:', priceX, currentY, { continued: true })
          doc.text(this.formatMoney(subtotal), { align: 'right' })
          currentY += 18

          doc.text(`Скидка (${order.discountPercent}%):`, priceX, currentY, { continued: true })
          doc.text(`-${this.formatMoney(discount)}`, { align: 'right' })
          currentY += 18
        }

        // Total
        doc.fontSize(14).font('Helvetica-Bold')
        doc.text('ИТОГО:', priceX, currentY, { continued: true })
        doc.text(this.formatMoney(totalPrice), { align: 'right' })

        // Footer
        doc.fontSize(9).font('Helvetica').moveDown(2)
        doc.text('Спасибо за покупку!', { align: 'center' })
        doc.text('При получении оплата наличными или картой', { align: 'center' })

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Generate waybill (накладная) PDF for an order
   */
  async generateWaybill(order: Order): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 })
        const chunks: Buffer[] = []

        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        // Header
        doc.fontSize(20).text('ТОВАРНАЯ НАКЛАДНАЯ', { align: 'center' })
        doc.moveDown()

        // Document details
        doc.fontSize(12)
        doc.text(`№ ${order.id} от ${new Date(order.createdAt).toLocaleDateString('ru-RU')}`)
        doc.moveDown()

        // Supplier info
        doc.fontSize(14).text('Поставщик:', { underline: true })
        doc.fontSize(11)
        doc.text('ИП "Сувенирная Лавка"')
        doc.text('ИНН: 1234567890')
        doc.text('Адрес: г. Москва, ул. Примерная, д. 1')
        doc.moveDown()

        // Customer info
        doc.fontSize(14).text('Покупатель:', { underline: true })
        doc.fontSize(11)
        doc.text(`${order.customerName}`)
        doc.text(`${order.email}`)
        if (order.phone) doc.text(`Тел: ${order.phone}`)
        doc.text(`Адрес доставки: ${order.address}`)
        doc.moveDown()

        // Items table
        doc.fontSize(12).text('Товары к отгрузке:', { underline: true })
        doc.moveDown(0.5)

        const tableTop = doc.y
        const numX = 50
        const itemX = 80
        const qtyX = 350
        const priceX = 430
        const totalX = 510

        // Table headers
        doc.fontSize(10).font('Helvetica-Bold')
        doc.text('№', numX, tableTop)
        doc.text('Наименование', itemX, tableTop)
        doc.text('Кол-во', qtyX, tableTop)
        doc.text('Цена', priceX, tableTop)
        doc.text('Сумма', totalX, tableTop)
        doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke()

        // Items
        doc.font('Helvetica')
        let currentY = tableTop + 25
        const items = order.items || []

        items.forEach((item, index) => {
          if (currentY > 700) {
            doc.addPage()
            currentY = 50
          }

          const itemName = item.name || `Товар #${item.productId}`
          const qty = item.quantity || 0
          const price = Number(item.price || 0)
          const total = qty * price

          doc.fontSize(9)
          doc.text((index + 1).toString(), numX, currentY)
          doc.text(itemName, itemX, currentY, { width: 260, ellipsis: true })
          doc.text(qty.toString(), qtyX, currentY)
          doc.text(this.formatMoney(price), priceX, currentY)
          doc.text(this.formatMoney(total), totalX, currentY)

          currentY += 22
        })

        // Total line
        doc.moveTo(50, currentY).lineTo(560, currentY).stroke()
        currentY += 15

        // Total
        doc.fontSize(12).font('Helvetica-Bold')
        doc.text(`Всего наименований: ${items.length}`, 50, currentY)
        doc.text(`Итого: ${this.formatMoney(order.totalPrice)}`, 350, currentY)
        currentY += 40

        // Signatures
        doc.fontSize(11).font('Helvetica')
        doc.text('Отпустил: _________________ (_________________)', 50, currentY)
        currentY += 30
        doc.text('Получил: _________________ (_________________)', 50, currentY)
        currentY += 40

        // Footer
        doc.fontSize(9)
        doc.text('Дата получения: _______________', 50, currentY)
        doc.text('Подпись: _______________', 350, currentY)

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Generate packing list (упаковочный лист) for production
   */
  async generatePackingList(order: Order): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 })
        const chunks: Buffer[] = []

        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        // Header
        doc.fontSize(20).text('УПАКОВОЧНЫЙ ЛИСТ', { align: 'center' })
        doc.moveDown()

        // Order info
        doc.fontSize(14).text(`Заказ №${order.id}`)
        doc.fontSize(11).text(`Дата: ${new Date(order.createdAt).toLocaleDateString('ru-RU')}`)
        doc.moveDown()

        // Customer
        doc.fontSize(12).text(`Клиент: ${order.customerName}`)
        doc.text(`Адрес: ${order.address}`)
        if (order.phone) doc.text(`Телефон: ${order.phone}`)
        doc.moveDown()

        // Items checklist
        doc.fontSize(14).text('Список товаров для упаковки:', { underline: true })
        doc.moveDown(0.5)

        const items = order.items || []
        let currentY = doc.y

        items.forEach((item, index) => {
          if (currentY > 700) {
            doc.addPage()
            currentY = 50
          }

          doc.fontSize(11)
          // Checkbox
          doc.rect(50, currentY, 12, 12).stroke()
          // Item details
          doc.text(
            `${index + 1}. ${item.name || `Товар #${item.productId}`} × ${item.quantity} шт.`,
            70,
            currentY,
          )

          currentY += 25
        })

        // Instructions
        doc.moveDown(2)
        doc.fontSize(12).font('Helvetica-Bold').text('Инструкции по упаковке:')
        doc.fontSize(10).font('Helvetica')
        doc.text('1. Проверьте соответствие товаров списку')
        doc.text('2. Используйте защитную упаковку для хрупких предметов')
        doc.text('3. Приложите накладную и счет к заказу')
        doc.text('4. Отметьте коробку номером заказа')

        // Footer
        doc.moveDown(2)
        doc.fontSize(11)
        doc.text('Упаковал: _________________ Дата: _______________')

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  private formatMoney(value: number | string): string {
    const num = Number(value || 0)
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num) + ' ₽'
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      new: 'Новый',
      pending: 'В ожидании',
      processing: 'В обработке',
      in_production: 'В производстве',
      ready: 'Готов',
      shipped: 'Отгружен',
      delivered: 'Доставлен',
      completed: 'Завершен',
      cancelled: 'Отменен',
      needs_materials: 'Требуются материалы',
    }
    return statusMap[status] || status
  }
}
