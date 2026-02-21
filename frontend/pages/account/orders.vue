<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Хлебные крошки -->
    <nav class="flex items-center gap-2 text-sm text-slate-500 mb-4">
      <NuxtLink to="/account" class="hover:text-slate-900 transition">Личный кабинет</NuxtLink>
      <span>→</span>
      <span class="text-slate-900">История заказов</span>
    </nav>

    <h1 class="text-3xl font-bold mb-6">История заказов</h1>

    <!-- Фильтры -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Статус -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Статус</label>
          <select v-model="filters.status" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="">Все</option>
            <option value="new">Новый</option>
            <option value="processing">В обработке</option>
            <option value="ready">Готов</option>
            <option value="shipped">Отгружен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>

        <!-- Дата от -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">От</label>
          <input v-model="filters.dateFrom" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </div>

        <!-- Дата до -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">До</label>
          <input v-model="filters.dateTo" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md">
        </div>

        <!-- Поиск -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="№ заказа или имя"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
        </div>
      </div>

      <!-- Кнопки -->
      <div class="mt-4 flex gap-2">
        <BaseButton @click="applyFilters" variant="primary">
          Применить
        </BaseButton>
        <BaseButton @click="resetFilters" variant="secondary">
          Сбросить
        </BaseButton>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="pending" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Загрузка заказов...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-700">{{ error.message || 'Ошибка загрузки заказов' }}</p>
    </div>

    <!-- Список заказов -->
    <div v-else-if="data?.orders?.length" class="space-y-4">
      <OrderCard
        v-for="order in data.orders"
        :key="order.id"
        :order="order"
      />

      <!-- Пагинация -->
      <div v-if="data.totalPages > 1" class="flex justify-center gap-2 mt-6">
        <BaseButton
          v-for="page in data.totalPages"
          :key="page"
          @click="goToPage(page)"
          :variant="page === data.page ? 'primary' : 'secondary'"
          size="sm"
        >
          {{ page }}
        </BaseButton>
      </div>

      <!-- Информация о пагинации -->
      <div class="text-center text-sm text-gray-600">
        Показано {{ data.orders.length }} из {{ data.total }} заказов
      </div>
    </div>

    <!-- Пусто -->
    <div v-else class="text-center py-12">
      <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">Нет заказов</h3>
      <p class="mt-2 text-gray-600">У вас пока нет оформленных заказов</p>
      <BaseButton variant="primary" size="lg" to="/catalog" class="mt-4">
        Перейти в каталог
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import OrderCard from '~/components/OrderCard.vue'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig, navigateTo, useAsyncData, useHead } from '#app'

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Проверка авторизации
if (!authStore.isAuthenticated) {
  navigateTo('/login')
}

const filters = ref({
  status: '',
  dateFrom: '',
  dateTo: '',
  search: '',
  page: 1,
  limit: 10,
})

const buildUrl = () => {
  const params = new URLSearchParams()
  if (filters.value.status) params.append('status', filters.value.status)
  if (filters.value.dateFrom) params.append('dateFrom', filters.value.dateFrom)
  if (filters.value.dateTo) params.append('dateTo', filters.value.dateTo)
  if (filters.value.search) params.append('search', filters.value.search)
  params.append('page', String(filters.value.page))
  params.append('limit', String(filters.value.limit))
  return `/api/orders/my?${params.toString()}`
}

const { data, pending, error, refresh } = await useAsyncData(
  'my-orders',
  () => $fetch(buildUrl(), {
    baseURL: config.public.apiBaseUrl,
    headers: authStore.accessToken ? {
      Authorization: `Bearer ${authStore.accessToken}`
    } : undefined
  }),
  { watch: [filters] }
)

const applyFilters = () => {
  filters.value.page = 1
  refresh()
}

const resetFilters = () => {
  filters.value = {
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    page: 1,
    limit: 10,
  }
  refresh()
}

const goToPage = (page: number) => {
  filters.value.page = page
  refresh()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

useHead({
  title: 'История заказов',
})
</script>
