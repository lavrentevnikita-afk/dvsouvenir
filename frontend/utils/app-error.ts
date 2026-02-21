export type NormalizedApiError = {
  code: string
  message: string
  details?: any
  requestId?: string
}

export function normalizeApiError(err: any): NormalizedApiError {
  const data = err?.data || err?.response?._data || undefined
  const code = data?.error?.code || data?.code || 'ERROR'
  const message = data?.error?.message || data?.message || err?.message || 'Ошибка запроса'
  const details = data?.error?.details || data?.details
  const requestId = data?.requestId
  return {
    code: String(code),
    message: Array.isArray(message) ? message.join(', ') : String(message),
    ...(typeof details !== 'undefined' ? { details } : {}),
    ...(requestId ? { requestId: String(requestId) } : {}),
  }
}

export type UiErrorHint = {
  title: string
  text: string
  actionLabel?: string
  action?: 'refresh_cart' | 'reload_order' | 'relogin'
}

export function mapErrorToUi(e: NormalizedApiError): UiErrorHint {
  switch (e.code) {
    case 'CART_ITEM_UNAVAILABLE':
      return {
        title: 'Товары недоступны',
        text: 'Некоторые товары сейчас недоступны в выбранном количестве. Обновите корзину и попробуйте снова.',
        actionLabel: 'Обновить корзину',
        action: 'refresh_cart',
      }
    case 'ORDER_STATUS_CONFLICT':
      return {
        title: 'Статус заказа изменился',
        text: 'Заказ уже обновлён кем-то ещё или находится в другом статусе. Перезагрузите страницу заказа.',
        actionLabel: 'Перезагрузить заказ',
        action: 'reload_order',
      }
    case 'FORBIDDEN_ROLE':
      return {
        title: 'Недостаточно прав',
        text: 'У вашей роли нет доступа к этому действию.',
      }
    case 'VALIDATION_ERROR':
      return {
        title: 'Проверьте данные',
        text: e.message || 'Некоторые поля заполнены неверно.',
      }
    case 'UNAUTHORIZED':
      return {
        title: 'Нужно войти',
        text: 'Сессия закончилась. Войдите снова.',
        actionLabel: 'Войти',
        action: 'relogin',
      }
    default:
      return {
        title: 'Ошибка',
        text: e.message || 'Что-то пошло не так. Попробуйте ещё раз.',
      }
  }
}
