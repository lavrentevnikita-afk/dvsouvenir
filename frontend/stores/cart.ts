import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export interface CartProductSnapshot {
  id: number
  name: string
  price: number
  // оптовая цена (если пришла с бэка или была на карточке товара)
  wholesalePrice?: number | null
  article?: string
  imageUrl?: string | null
  // optional metadata for smarter UI (non-breaking)
  categorySlug?: string | null
  categoryName?: string | null
}

export interface CartItem {
  product: CartProductSnapshot
  quantity: number
}

interface CartState {
  items: CartItem[]
  _storageKey: string | null
}

const STORAGE_PREFIX = 'cart'

function storageKey(userId?: number | null) {
  return userId ? `${STORAGE_PREFIX}:user:${userId}` : `${STORAGE_PREFIX}:guest`
}

function normalizeItems(parsed: any): CartItem[] {
  if (!Array.isArray(parsed)) return []
  return parsed.map((item: any) => ({
    ...item,
    quantity: Number(item.quantity) || 1,
    product: {
      ...item.product,
      id: Number(item.product?.id),
      price: Number(item.product?.price),
      wholesalePrice:
        item.product?.wholesalePrice === undefined || item.product?.wholesalePrice === null
          ? null
          : Number(item.product?.wholesalePrice),
    },
  }))
}

function loadFromStorage(key: string): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return normalizeItems(parsed)
  } catch {
    return []
  }
}

function saveToStorage(key: string, items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // ignore
  }
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    _storageKey: null,
  }),
  getters: {
    totalItems(state): number {
      return state.items.reduce((acc, item) => acc + item.quantity, 0)
    },
    totalPrice(state): number {
      return state.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    },
    isEmpty(): boolean {
      return this.totalItems === 0
    },
  },
  actions: {
    _ensureKey() {
      if (this._storageKey) return
      const auth = useAuthStore()
      this._storageKey = storageKey(auth.user?.id ?? null)
    },

    initFromStorage() {
      this._ensureKey()
      this.items = loadFromStorage(this._storageKey!)
    },

    /**
     * Вызывается при смене пользователя (через клиентский плагин).
     * Делает перенос guest -> user при первом логине, если у пользователя ещё пусто.
     */
    handleAuthChange(userId: number | null | undefined, prevUserId?: number | null | undefined) {
      // login: guest -> user (один раз, если у user ещё пусто)
      if ((!prevUserId || prevUserId === null) && userId) {
        const guestKey = storageKey(null)
        const userKey = storageKey(userId)

        const guestItems = loadFromStorage(guestKey)
        const userItems = loadFromStorage(userKey)

        if (userItems.length === 0 && guestItems.length > 0) {
          saveToStorage(userKey, guestItems)
          try {
            window.localStorage.removeItem(guestKey)
          } catch {
            // ignore
          }
        }
      }

      // просто переключаемся на новое хранилище
      const nextKey = storageKey(userId ?? null)
      this._storageKey = nextKey
      this.items = loadFromStorage(nextKey)
    },

    _persist() {
      this._ensureKey()
      saveToStorage(this._storageKey!, this.items)
    },

    addItem(product: CartProductSnapshot, quantity = 1) {
      this._ensureKey()
      const existing = this.items.find((i) => i.product.id === product.id)
      if (existing) {
        existing.quantity += quantity
        // если раньше не было оптовой цены, а теперь пришла — сохраним
        if (existing.product.wholesalePrice == null && product.wholesalePrice != null) {
          existing.product.wholesalePrice = Number(product.wholesalePrice)
        }
      } else {
        this.items.push({ product, quantity })
      }
      this._persist()
    },

    removeItem(productId: number) {
      this._ensureKey()
      this.items = this.items.filter((item) => item.product.id !== productId)
      this._persist()
    },

    setQuantity(productId: number, quantity: number) {
      this._ensureKey()
      const item = this.items.find((i) => i.product.id === productId)
      if (!item) return
      if (quantity <= 0) {
        this.removeItem(productId)
      } else {
        item.quantity = quantity
        this._persist()
      }
    },

    clear() {
      this._ensureKey()
      this.items = []
      this._persist()
    },
  },
})
