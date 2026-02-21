import { useAuthStore } from '~/stores/auth'

// Доступ: production (и admin для отладки)
export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  auth.initFromStorage()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  try {
    await auth.fetchMe()
  } catch {
    auth.logout()
    return navigateTo('/login')
  }

  if (auth.user?.role !== 'production' && auth.user?.role !== 'admin') {
    // магазины -> b2b, остальные -> главная
    if (auth.user?.role === 'store') return navigateTo('/b2b')
    if (auth.user?.role === 'manager') return navigateTo('/admin')
    return navigateTo('/')
  }
})
