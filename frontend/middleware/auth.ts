export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

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
