<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-4">Личный кабинет</h1>

    <!-- Не авторизован -->
    <div v-if="!user">
      <p class="mb-4">Вы не авторизованы.</p>
      <NuxtLink
        to="/login"
        class="inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition"
      >
        Войти
      </NuxtLink>
    </div>

    <!-- Авторизован -->
    <div v-else class="space-y-6">
      <!-- 1. Быстрые ссылки -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink to="/account/orders" class="block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition">
          <div class="flex items-center gap-3">
            <div class="text-2xl">📦</div>
            <div>
              <h3 class="font-semibold">Мои заказы</h3>
              <p class="text-sm text-gray-600">История покупок</p>
            </div>
          </div>
        </NuxtLink>
        
        <NuxtLink to="/account/profile" class="block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition">
          <div class="flex items-center gap-3">
            <div class="text-2xl">👤</div>
            <div>
              <h3 class="font-semibold">Профиль</h3>
              <p class="text-sm text-gray-600">Редактировать данные</p>
            </div>
          </div>
        </NuxtLink>
        
        <!-- Избранное (удалено) -->
      </div>

      <!-- 2. Информация о профиле и роли -->
      <div class="rounded-xl border border-slate-200 p-5 bg-white">
        <h2 class="text-lg font-semibold mb-3">Информация о профиле</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div><span class="text-slate-500">Имя:</span> <span class="font-medium">{{ user.name }}</span></div>
          <div><span class="text-slate-500">Email:</span> <span class="font-medium">{{ user.email }}</span></div>
          <div v-if="user.phone"><span class="text-slate-500">Телефон:</span> <span class="font-medium">{{ user.phone }}</span></div>
          <div v-if="user.city"><span class="text-slate-500">Город:</span> <span class="font-medium">{{ user.city }}</span></div>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
          <span class="text-sm text-slate-500">Тип аккаунта:</span>
          <span
            class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
            :class="
              user.role === 'store'
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : user.role === 'manager'
                ? 'border-sky-300 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-slate-50 text-slate-700'
            "
          >
            {{ roleLabel }}
          </span>

          <NuxtLink
            v-if="user.role === 'admin'"
            to="/admin"
            class="ml-auto text-sm text-blue-600 hover:underline"
          >
            Админ-панель →
          </NuxtLink>

          <!-- B2B и кнопка 'Стать партнёром' убраны -->
        </div>
      </div>

      <!-- 3. Заказы в пути -->
      <div v-if="ordersInTransit.length" class="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-xl">🚚</span>
          <h2 class="text-lg font-semibold text-blue-900">Заказы в пути</h2>
          <span class="ml-auto text-sm text-blue-700">{{ ordersInTransit.length }} {{ pluralize(ordersInTransit.length, 'заказ', 'заказа', 'заказов') }}</span>
        </div>
        <div class="space-y-3">
          <NuxtLink
            v-for="order in ordersInTransit"
            :key="order.id"
            :to="`/account/orders?id=${order.id}`"
            class="block bg-white rounded-lg border border-blue-100 p-4 hover:shadow-md transition"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold text-slate-900">Заказ #{{ order.id }}</div>
                <div class="text-sm text-slate-600">{{ formatDate(order.createdAt) }}</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-slate-900">{{ formatMoney(order.totalPrice) }} ₽</div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="statusClass(order.status)">
                  {{ statusLabel(order.status) }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- 4. Вы смотрели -->
      <div v-if="recentlyViewed.length" class="rounded-xl border border-slate-200 bg-white p-5">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-xl">👁️</span>
          <h2 class="text-lg font-semibold text-slate-900">Вы смотрели</h2>
          <NuxtLink to="/catalog" class="ml-auto text-sm text-blue-600 hover:underline">Смотреть все →</NuxtLink>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-2">
          <NuxtLink
            v-for="product in recentlyViewed.slice(0, 8)"
            :key="product.id"
            :to="`/product/${product.slug ?? product.id}`"
            class="flex-shrink-0 w-28 group"
          >
            <div class="w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group-hover:ring-2 group-hover:ring-blue-400 transition">
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                :alt="product.name"
                class="w-full h-full object-cover"
              />
              <span v-else class="flex items-center justify-center text-xs text-slate-400 h-full">Фото</span>
            </div>
            <div class="mt-2 text-sm text-slate-700 truncate">{{ product.name }}</div>
            <div class="text-sm font-semibold text-slate-900">{{ formatMoney(product.retailPrice) }} ₽</div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const config = useRuntimeConfig()
const toast = useToast()

const user = computed(() => authStore.user)

const roleLabel = computed(() => {
  const role = user.value?.role
  if (role === 'store') return 'Магазин'
  if (role === 'manager') return 'Менеджер'
  if (role === 'admin') return 'Администратор'
  return 'Розница'
})

// Заказы пользователя
const orders = ref<any[]>([])
const loadingOrders = ref(false)

async function loadOrders() {
  if (!authStore.accessToken) return
  loadingOrders.value = true
  try {
    const res = await $fetch<any>('/api/orders/my', {
      baseURL: config.public.apiBaseUrl,
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
      query: { limit: 20 },
    })
    orders.value = res?.orders || []
  } catch {
    orders.value = []
  } finally {
    loadingOrders.value = false
  }
}

// Заказы в пути (статусы: processing, ready, shipped)
const ordersInTransit = computed(() => {
  return orders.value.filter(o => ['processing', 'ready', 'shipped', 'in_work'].includes(o.status))
})

// Доставленные заказы (для отзывов)
const deliveredOrders = computed(() => {
  return orders.value.filter(o => o.status === 'delivered')
})

// История просмотров (из composable)
const { items: recentlyViewed, load: loadRecentlyViewed } = useRecentlyViewed()

// Модалка отзыва
const reviewModal = ref({
  open: false,
  order: null as any,
  item: null as any,
  rating: 5,
  comment: '',
  loading: false,
})

function openReviewModal(order: any, item: any) {
  reviewModal.value = {
    open: true,
    order,
    item,
    rating: 5,
    comment: '',
    loading: false,
  }
}

function closeReviewModal() {
  reviewModal.value.open = false
}

async function submitReview() {
  if (!reviewModal.value.item) return
  const name = user.value?.name || 'Пользователь'
  const rating = reviewModal.value.rating
  const text = reviewModal.value.comment.trim()

  if (!text) {
    toast.error('Напишите пару слов в отзыве')
    return
  }

  reviewModal.value.loading = true
  try {
    // Сохраняем отзыв в localStorage (как ProductReviewsBasic)
    const productId = reviewModal.value.item.productId
    const key = `reviews:${productId}`
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    const newReview = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name,
      rating,
      text,
      createdAt: new Date().toISOString(),
    }
    existing.unshift(newReview)
    localStorage.setItem(key, JSON.stringify(existing))

    toast.success('Отзыв сохранён!')
    closeReviewModal()
  } catch (err: any) {
    toast.error('Ошибка сохранения отзыва')
  } finally {
    reviewModal.value.loading = false
  }
}

// Helpers
function pluralize(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU')
}

function formatMoney(v: any) {
  return Number(v || 0).toLocaleString('ru-RU')
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    new: 'Новый',
    processing: 'В обработке',
    in_work: 'В работе',
    ready: 'Готов',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  }
  return map[s] || s
}

function statusClass(s: string) {
  if (s === 'delivered') return 'bg-green-100 text-green-800'
  if (s === 'shipped') return 'bg-blue-100 text-blue-800'
  if (s === 'cancelled') return 'bg-red-100 text-red-800'
  return 'bg-slate-100 text-slate-700'
}

onMounted(() => {
  loadOrders()
  loadRecentlyViewed()
})
</script>
