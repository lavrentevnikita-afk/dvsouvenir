import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

export interface StoreContext {
  discountPercent: number
}

export interface AuthUser {
  id: number
  name: string
  email: string
  role?: 'customer' | 'store' | 'manager' | 'production' | 'admin'
  phone?: string | null
  city?: string | null
  address?: string | null
  createdAt: string
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  initialized: boolean
  storeContext: StoreContext | null
}

const STORAGE_KEY = 'dvsouvenir_auth'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    initialized: false,
    storeContext: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user && !!state.accessToken,
  },
  actions: {
    initFromStorage() {
      if (this.initialized) return
      if (process.client) {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as {
              user: AuthUser
              accessToken: string
            }
            this.user = parsed.user
            this.accessToken = parsed.accessToken
          } catch {
            // ignore
          }
        }
      }
      this.initialized = true
    },
    persist() {
      if (!process.client) return
      if (!this.user || !this.accessToken) {
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: this.user,
          accessToken: this.accessToken,
        })
      )
    },
    setSession(payload: { user: AuthUser; accessToken: string }) {
      this.user = payload.user
      this.accessToken = payload.accessToken
      this.persist()
    },
    clearSession() {
      this.user = null
      this.accessToken = null
      this.persist()
    },
    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      const { accessToken, user } = await $fetch<{
        accessToken: string
        user: AuthUser
      }>('/api/auth/login', {
        method: 'POST',
        baseURL: apiBaseUrl,
        body: { email, password },
      })

      this.setSession({ accessToken, user })
    },
    async register(name: string, email: string, password: string) {
      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      const { accessToken, user } = await $fetch<{
        accessToken: string
        user: AuthUser
      }>('/api/auth/register', {
        method: 'POST',
        baseURL: apiBaseUrl,
        body: { name, email, password },
      })

      this.setSession({ accessToken, user })
    },
    async fetchMe() {
      if (!this.accessToken) return

      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      const { user } = await $fetch<{ user: AuthUser }>('/api/auth/me', {
        baseURL: apiBaseUrl,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      this.user = user

      // Если это магазин — подтянем скидку/контекст магазина
      if (this.user?.role === 'store') {
        try {
          await this.fetchStoreContext()
        } catch {
          // не критично
        }
      } else {
        this.storeContext = null
      }

      this.persist()
    },

    async fetchStoreContext() {
      if (!this.accessToken) return
      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      const data = await $fetch<any>('/api/b2b/me', {
        baseURL: apiBaseUrl,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      const discountPercent = Number(data?.storeProfile?.discountPercent ?? 0)
      const status = data?.storeProfile?.status || 'lead'
      const moderationNote = data?.storeProfile?.moderationNote || null
      this.storeContext = { discountPercent, status, moderationNote }
    },

    logout() {
      this.clearSession()
    },
  },
})
