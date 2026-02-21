import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const cart = useCartStore()

  // подтягиваем сессию до запуска миграции
  auth.initFromStorage()

  watch(
    () => auth.user?.id ?? null,
    (id, prev) => {
      cart.handleAuthChange(id, prev)
      // Wishlist теперь загружается через API при авторизации
    },
    { immediate: true }
  )
})
