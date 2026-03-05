import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'
import { useAuthStore } from './auth'

export type CityOption = {
  code: string
  name: string
  regionCode?: string
  shortName?: string
  fullName?: string
}

const STORAGE_KEY = 'dvsouvenir_city'
const FALLBACK_CITIES: CityOption[] = []

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
    normalizeCityRow(row: any): CityOption | null {
      const code = String(row?.code || row?.cityCode || '').trim().toUpperCase()
      if (!code) return null

      const shortName = String(row?.shortName || row?.nameShort || row?.short || row?.name || '').trim()
      const fullName = String(row?.fullName || row?.nameFull || row?.full || row?.name || shortName || code).trim()
      const regionCode = String(row?.regionCode || row?.region || '').trim()

      return {
        code,
        name: shortName || fullName || code,
        shortName: shortName || undefined,
        fullName: fullName || undefined,
        regionCode: regionCode || undefined,
      }
    },

    resolveCity(input: string | null | undefined): CityOption | null {
      const raw = String(input || '').trim()
      if (!raw) return null
      const upper = raw.toUpperCase()

      const found = this.cities.find((c) => {
        const code = String(c.code || '').trim().toUpperCase()
        const name = String(c.name || '').trim().toUpperCase()
        const shortName = String(c.shortName || '').trim().toUpperCase()
        const fullName = String(c.fullName || '').trim().toUpperCase()
        return code === upper || name === upper || shortName === upper || fullName === upper
      })

      return found || {
        code: upper,
        name: raw,
        shortName: raw,
        fullName: raw,
      }
    },

    async loadCities() {
      const config = useRuntimeConfig()
      const apiBaseUrl = process.server
        ? (config as any).apiBaseUrl
        : (config.public as any).apiBaseUrl

      try {
        const res = await $fetch<{ cities: any[] }>('/api/catalog/cities')
        const normalized = Array.isArray(res?.cities)
          ? res.cities.map((row) => this.normalizeCityRow(row)).filter(Boolean) as CityOption[]
          : []

        if (normalized.length) {
          this.cities = normalized
          return
        }
      } catch {
        // try explicit baseURL fallback below
      }

      try {
        const res = await $fetch<{ cities: any[] }>('/api/catalog/cities', {
          baseURL: apiBaseUrl,
        })
        const normalized = Array.isArray(res?.cities)
          ? res.cities.map((row) => this.normalizeCityRow(row)).filter(Boolean) as CityOption[]
          : []

        if (normalized.length) {
          this.cities = normalized
        }
      } catch {
        this.cities = FALLBACK_CITIES
      }
    },

    async init() {
      if (this.initialized) return
      if (!process.client) {
        return
      }

      await this.loadCities()

      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CityOption
          if (parsed?.code) {
            if (String(parsed.code).trim().toUpperCase() === 'MAIN') {
              this.city = null
            } else {
              const found = this.cities.find((c) => c.code === parsed.code)
              this.city = found || {
                code: String(parsed.code),
                name: String(parsed.name || parsed.code),
                shortName: String(parsed.shortName || parsed.name || parsed.code),
                fullName: String(parsed.fullName || parsed.name || parsed.code),
                regionCode: String(parsed.regionCode || ''),
              }
            }
          }
        } catch {
          // ignore
        }
      }

      if (!this.city) {
        const auth = useAuthStore()
        auth.initFromStorage()
        const accountCity = auth.user?.city
        if (accountCity) {
          this.city = this.resolveCity(accountCity)
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

      const next = this.resolveCity(code)
      if (!next) {
        this.city = null
        this.persist()
        return
      }

      this.city = next
      this.persist()
    },
  },
})

export const CITY_OPTIONS = FALLBACK_CITIES
