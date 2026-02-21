import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  auth.initFromStorage()

  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }

  // подтянем актуального юзера (роль)
  try {
    await auth.fetchMe()
  } catch {
    auth.logout()
    return navigateTo('/login')
  }

  // Жёсткое разделение layout-ов:
  // - B2B: только store
  // - Staff (admin/manager) живут в /admin
  if (auth.user?.role === 'admin' || auth.user?.role === 'manager') {
    return navigateTo('/admin')
  }

  if (auth.user?.role !== 'store') {
    // не магазин — не пускаем в B2B
    return navigateTo('/')
  }
  // Если магазин, редиректим на главную
  return navigateTo('/')
})
