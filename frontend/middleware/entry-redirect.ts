import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()
  auth.initFromStorage()

  if (!auth.accessToken) return

  try {
    await auth.fetchMe()
  } catch {
    auth.logout()
    return
  }

  const role = auth.user?.role
  if (role === 'admin' || role === 'manager') return navigateTo('/admin')
  if (role === 'production') return navigateTo('/admin/production')
  if (role === 'store') return navigateTo('/b2b')
})
