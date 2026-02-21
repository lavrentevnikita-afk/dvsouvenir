import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: true,
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
    }
  },
  ssr: true,

  modules: [
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  typescript: {
    strict: true,
    typeCheck: false
  },

  components: [
    {
      path: '~/components/ui',
      pathPrefix: false
    },
    '~/components'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  // ✅ ВОТ СЮДА ДОБАВЛЯЕМ
  routeRules: {
    '/uploads/**': {
      // В Docker фронт общается с backend по имени сервиса
      proxy: 'http://backend:4000/uploads/**'
    },
    '/api/**': {
      proxy: 'http://backend:4000/api/**'
    }
  },

  runtimeConfig: {
    apiBaseUrl: process.env.NUXT_API_BASE_URL || 'http://backend:4000',

    public: {
      apiBaseUrl:
        process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Дальневосточный Сувенир',
      pwaEnabled: process.env.NUXT_PUBLIC_PWA_ENABLED !== 'false'
    }
  },

  app: {
    head: {
      title: 'Дальневосточный Сувенир',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icons/icon-512x512.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
      ]
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Дальневосточный Сувенир',
      short_name: 'ДВ Сувенир',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#3659fa',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,webp,ico,json}']
    },
    client: {
      installPrompt: true
    },
    injectRegister: 'auto'
  },

  compatibilityDate: '2025-12-10'
})
