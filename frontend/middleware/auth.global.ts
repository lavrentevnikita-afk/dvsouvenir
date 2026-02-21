import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return

  // Не защищаем страницу логина
  if (to.path === '/login') return

  const authStore = useAuthStore()

  // Показываем заглушку-загрузку, пока не проверили авторизацию
  if (!authStore.initialized) {
    await authStore.initFromStorage()
    if (!authStore.isAuthenticated) {
      return navigateTo('/login')
    }
  } else if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
