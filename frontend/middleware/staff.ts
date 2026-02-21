import { useAuthStore } from '~/stores/auth'

// Доступ: manager и admin
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

  if (auth.user?.role !== 'manager' && auth.user?.role !== 'admin') {
    return navigateTo('/b2b')
  }
})
