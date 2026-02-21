<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-6">Управление заказами</h1>

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

          <!-- Поиск -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="№, имя, email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
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
        </div>

        <div class="mt-4 flex gap-2">
          <button @click="applyFilters" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Применить
          </button>
          <button @click="resetFilters" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Сбросить
          </button>
        </div>
      </div>

      <!-- Загрузка -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Загрузка заказов...</p>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700">{{ error.message || 'Ошибка загрузки заказов' }}</p>
      </div>

      <!-- Таблица заказов -->
      <div v-else-if="data?.orders?.length" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                № Заказа
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сумма
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in data.orders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #{{ order.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ order.customerName }}</div>
                <div class="text-sm text-gray-500">{{ order.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ formatPrice(order.totalPrice) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)" class="px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <NuxtLink
                  :to="`/manager/orders/${order.id}`"
                  class="text-blue-600 hover:text-blue-900"
                >
                  Подробнее
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Пагинация -->
        <div v-if="data.totalPages > 1" class="px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div class="text-sm text-gray-700">
            Показано {{ data.orders.length }} из {{ data.total }} заказов
          </div>
          <div class="flex gap-2">
            <button
              v-for="page in data.totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded-md text-sm',
                page === data.page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>

      <!-- Пусто -->
      <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">Заказов не найдено</h3>
        <p class="mt-2 text-gray-600">Попробуйте изменить фильтры</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig, navigateTo, useAsyncData, useHead } from '#app'

const authStore = useAuthStore()
const config = useRuntimeConfig()

// Проверка роли
if (!['manager', 'admin'].includes(authStore.user?.role || '')) {
  navigateTo('/')
}

const filters = ref({
  status: '',
  search: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  limit: 20,
})

const buildUrl = () => {
  const params = new URLSearchParams()
  if (filters.value.status) params.append('status', filters.value.status)
  if (filters.value.search) params.append('search', filters.value.search)
  if (filters.value.dateFrom) params.append('dateFrom', filters.value.dateFrom)
  if (filters.value.dateTo) params.append('dateTo', filters.value.dateTo)
  params.append('page', String(filters.value.page))
  params.append('limit', String(filters.value.limit))
  return `/api/manager/orders?${params.toString()}`
}

const { data, pending, error, refresh } = await useAsyncData(
  'manager-orders',
  () => $fetch(buildUrl(), {
    baseURL: config.public.apiBaseUrl,
    headers: authStore.accessToken ? {
      Authorization: `Bearer ${authStore.accessToken}`
    } : undefined
  })
)

const applyFilters = () => {
  filters.value.page = 1
  refresh()
}

const resetFilters = () => {
  filters.value = {
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20,
  }
  refresh()
}

const goToPage = (page: number) => {
  filters.value.page = page
  refresh()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price)
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    new: 'Новый',
    processing: 'В обработке',
    ready: 'Готов',
    shipped: 'Отгружен',
    delivered: 'Доставлен',
    cancelled: 'Отменен'
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

useHead({
  title: 'Управление заказами - Менеджер',
})
</script>
