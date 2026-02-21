import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from './auth'

export type CityOption = { code: string; name: string }

const STORAGE_KEY = 'dvsouvenir_city'

// Fallback: used only if API is not reachable
const FALLBACK_CITIES: CityOption[] = [
  { code: 'MAIN', name: 'Производство' },
]

interface CityState {
  city: CityOption | null
  cities: CityOption[]
  initialized: boolean
}

export const useCityStore = defineStore('city', {
  state: (): CityState => ({
    city: null,
    cities: FALLBACK_CITIES,
    initialized: false,
  }),
  getters: {
    code: (s) => s.city?.code ?? null,
    name: (s) => s.city?.name ?? null,
  },
  actions: {
    async loadCities() {
      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      try {
        const res = await $fetch<{ cities: CityOption[] }>('/api/catalog/cities', {
          baseURL: apiBaseUrl,
        })
        if (Array.isArray(res?.cities) && res.cities.length) {
          this.cities = res.cities
        }
      } catch {
        // keep fallback
      }
    },

    async init() {
      if (this.initialized) return
      if (!process.client) {
        this.initialized = true
        return
      }

      // Cities list (dynamic)
      await this.loadCities()

      // 1) localStorage — user selection has priority
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CityOption
          if (parsed?.code) {
            const found = this.cities.find((c) => c.code === parsed.code)
            this.city = found || { code: String(parsed.code), name: String(parsed.name || parsed.code) }
          }
        } catch {
          // ignore
        }
      }

      // 2) account city (only if no local selection)
      if (!this.city) {
        const auth = useAuthStore()
        auth.initFromStorage()
        const accountCity = auth.user?.city
        if (accountCity) {
          const found = this.cities.find((c) => c.code === accountCity) || {
            code: String(accountCity),
            name: String(accountCity),
          }
          this.city = found
        }
      }

      this.initialized = true
      this.persist()
    },

    persist() {
      if (!process.client) return
      if (!this.city) {
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.city))
    },

    async setCity(code: string | null) {
      if (!code) {
        this.city = null
        this.persist()
        return
      }

      const c = String(code).trim().toUpperCase()
      const next = this.cities.find((x) => x.code === c) || { code: c, name: c }
      this.city = next
      this.persist()
      // ВАЖНО: город выбора витрины НЕ должен менять профиль и не должен разлогинивать.
    },
  },
})

// Backward-compat export (some pages used CITY_OPTIONS)
export const CITY_OPTIONS = FALLBACK_CITIES
