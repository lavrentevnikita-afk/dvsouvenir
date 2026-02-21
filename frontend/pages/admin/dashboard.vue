<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['staff'],
})

import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const apiBaseUrl = computed(() => {
  const config = useRuntimeConfig()
  return process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl
})

const isAdmin = computed(() => auth.user?.role === 'admin')

const loading = ref(false)
const err = ref('')

const dashboard = ref<any>(null)
const sales = ref<any[]>([])
const retailVsB2b = ref<any>(null)

const selectedDays = ref(30)

function money(v: any) {
  const n = Number(v || 0)
  try {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' ₽'
  } catch {
    return `${Math.round(n)} ₽`
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  } catch {
    return dateStr
  }
}

async function api<T>(path: string, opts?: any) {
  if (!auth.accessToken) throw new Error('Нет токена')
  return await $fetch<T>(path, {
    baseURL: apiBaseUrl.value,
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    ...(opts || {}),
  })
}

async function loadDashboard() {
  if (!isAdmin.value) return
  loading.value = true
  err.value = ''
  try {
    dashboard.value = await api<any>('/api/admin/analytics/dashboard')
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || 'Не удалось загрузить данные дашборда'
  } finally {
    loading.value = false
  }
}

async function loadSales() {
  if (!isAdmin.value) return
  try {
    sales.value = await api<any[]>('/api/admin/analytics/sales', {
      query: { days: selectedDays.value },
    } as any)
  } catch (e: any) {
    console.error('Error loading sales:', e)
  }
}

async function loadRetailVsB2b() {
  if (!isAdmin.value) return
  try {
    retailVsB2b.value = await api<any>('/api/admin/analytics/retail-vs-b2b')
  } catch (e: any) {
    console.error('Error loading retail vs b2b:', e)
  }
}

async function loadAll() {
  await Promise.all([loadDashboard(), loadSales(), loadRetailVsB2b()])
}

onMounted(() => {
  loadAll()
})

const maxRevenue = computed(() => {
  if (!sales.value?.length) return 0
  return Math.max(...sales.value.map((s) => Number(s.revenue || 0)))
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">📊 Дашборд администратора</h1>
      <p class="text-gray-600 mt-2">Ключевые метрики и аналитика</p>
    </div>

    <!-- Error -->
    <div v-if="err" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
      {{ err }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">Загрузка данных...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboard" class="space-y-8">
      <!-- Key Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Revenue -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Общая выручка</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">{{ money(dashboard.totalRevenue) }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-lg">
              <span class="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <!-- Total Orders -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Всего заказов</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">{{ dashboard.ordersCount }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-lg">
              <span class="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <!-- Average Order Value -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Средний чек</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">{{ money(dashboard.averageOrderValue) }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-lg">
              <span class="text-2xl">💳</span>
            </div>
          </div>
        </div>

        <!-- Orders Today -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Заказов сегодня</p>
              <p class="text-2xl font-bold text-gray-900 mt-2">{{ dashboard.ordersToday }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-lg">
              <span class="text-2xl">🔥</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Period Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">📈 Статистика по периодам</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Эта неделя:</span>
              <span class="font-semibold text-gray-900">{{ dashboard.ordersThisWeek }} заказов</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Этот месяц:</span>
              <span class="font-semibold text-gray-900">{{ dashboard.ordersThisMonth }} заказов</span>
            </div>
          </div>
        </div>

        <!-- Retail vs B2B (if loaded) -->
        <div v-if="retailVsB2b" class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🏪 Розница vs B2B</h3>
          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600">Розница</span>
                <span class="text-sm font-medium">{{ retailVsB2b.retail.ordersShare.toFixed(1) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-500 h-2 rounded-full"
                  :style="{ width: retailVsB2b.retail.ordersShare + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ retailVsB2b.retail.ordersCount }} заказов • {{ money(retailVsB2b.retail.revenue) }}
              </p>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600">B2B</span>
                <span class="text-sm font-medium">{{ retailVsB2b.b2b.ordersShare.toFixed(1) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-500 h-2 rounded-full"
                  :style="{ width: retailVsB2b.b2b.ordersShare + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ retailVsB2b.b2b.ordersCount }} заказов • {{ money(retailVsB2b.b2b.revenue) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Chart -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">📊 Продажи по дням</h3>
          <select
            v-model.number="selectedDays"
            @change="loadSales"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option :value="7">7 дней</option>
            <option :value="14">14 дней</option>
            <option :value="30">30 дней</option>
            <option :value="90">90 дней</option>
          </select>
        </div>

        <div v-if="sales.length" class="space-y-2">
          <div v-for="day in sales" :key="day.date" class="flex items-center gap-3">
            <span class="text-xs text-gray-500 w-16">{{ formatDate(day.date) }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
              <div
                class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center px-3 text-white text-sm font-medium"
                :style="{ width: maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 + '%' : '0%' }"
              >
                <span v-if="day.revenue > maxRevenue * 0.15">{{ money(day.revenue) }}</span>
              </div>
            </div>
            <span class="text-xs text-gray-600 w-20 text-right">{{ day.ordersCount }} зак.</span>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">Нет данных за выбранный период</div>
      </div>

      <!-- Top Products -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🏆 Топ-5 товаров</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-gray-200">
              <tr>
                <th class="text-left py-3 px-2 font-medium text-gray-600">#</th>
                <th class="text-left py-3 px-2 font-medium text-gray-600">Товар</th>
                <th class="text-left py-3 px-2 font-medium text-gray-600">Артикул</th>
                <th class="text-right py-3 px-2 font-medium text-gray-600">Кол-во</th>
                <th class="text-right py-3 px-2 font-medium text-gray-600">Выручка</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(product, idx) in dashboard.topProducts"
                :key="product.productId"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-2 text-gray-500">{{ idx + 1 }}</td>
                <td class="py-3 px-2 font-medium text-gray-900">{{ product.name }}</td>
                <td class="py-3 px-2 text-gray-600">{{ product.article }}</td>
                <td class="py-3 px-2 text-right text-gray-900">{{ product.qty }}</td>
                <td class="py-3 px-2 text-right font-semibold text-gray-900">
                  {{ money(product.revenue) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">🕒 Последние заказы</h3>
        <div class="space-y-3">
          <div
            v-for="order in dashboard.recentOrders"
            :key="order.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-900">Заказ #{{ order.id }}</p>
              <p class="text-sm text-gray-600">{{ order.customerName || order.email }}</p>
            </div>
            <div class="flex items-center gap-4">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-yellow-100 text-yellow-800': order.status === 'new' || order.status === 'pending',
                  'bg-blue-100 text-blue-800': order.status === 'processing' || order.status === 'in_production',
                  'bg-green-100 text-green-800': order.status === 'completed' || order.status === 'shipped',
                  'bg-gray-100 text-gray-800': order.status === 'cancelled',
                }"
              >
                {{ order.status }}
              </span>
              <span class="font-semibold text-gray-900 w-32 text-right">{{ money(order.totalPrice) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink
          to="/admin/analytics"
          class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition"
        >
          <div class="text-3xl mb-3">📈</div>
          <h4 class="font-semibold text-lg">Детальная аналитика</h4>
          <p class="text-sm text-blue-100 mt-1">Отчеты и фильтры</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/orders"
          class="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition"
        >
          <div class="text-3xl mb-3">📦</div>
          <h4 class="font-semibold text-lg">Управление заказами</h4>
          <p class="text-sm text-purple-100 mt-1">Обработка и статусы</p>
        </NuxtLink>

        <NuxtLink
          to="/admin/catalog"
          class="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition"
        >
          <div class="text-3xl mb-3">🛍️</div>
          <h4 class="font-semibold text-lg">Каталог товаров</h4>
          <p class="text-sm text-green-100 mt-1">Управление продуктами</p>
        </NuxtLink>
      </div>
    </div>

    <!-- No data -->
    <div v-else-if="!loading" class="text-center py-12 text-gray-500">
      <p>Нет данных для отображения</p>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
