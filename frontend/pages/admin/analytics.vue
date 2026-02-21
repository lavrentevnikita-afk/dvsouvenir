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

const dateFrom = ref('')
const dateTo = ref('')
const city = ref('')

const sortTop = ref<'revenue' | 'qty'>('revenue')

const overview = ref<any>(null)

function fmtDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function setPreset(preset: 'week' | 'month' | 'quarter') {
  const now = new Date()
  const start = new Date(now)
  if (preset === 'week') start.setDate(start.getDate() - 6)
  if (preset === 'month') start.setDate(start.getDate() - 29)
  if (preset === 'quarter') start.setDate(start.getDate() - 89)
  dateFrom.value = fmtDate(start)
  dateTo.value = fmtDate(now)
}

function money(v: any) {
  const n = Number(v || 0)
  try {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' ₽'
  } catch {
    return `${Math.round(n)} ₽`
  }
}

function percent(v: any) {
  const n = Number(v || 0)
  return `${Math.round(n * 1000) / 10}%`
}

async function api<T>(path: string, opts?: any) {
  if (!auth.accessToken) throw new Error('Нет токена')
  return await $fetch<T>(path, {
    baseURL: apiBaseUrl.value,
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    ...(opts || {}),
  })
}

async function load() {
  if (!isAdmin.value) return
  loading.value = true
  err.value = ''
  try {
    overview.value = await api<any>('/api/admin/analytics/overview', {
      query: {
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
        city: city.value || undefined,
      },
    } as any)
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || 'Не удалось загрузить аналитику'
  } finally {
    loading.value = false
  }
}

const topProductsSorted = computed(() => {
  const arr = (overview.value?.topProducts || []) as any[]
  const key = sortTop.value === 'qty' ? 'qty' : 'revenue'
  return [...arr].sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))
})

const topCategoriesSorted = computed(() => {
  const arr = (overview.value?.topCategories || []) as any[]
  const key = sortTop.value === 'qty' ? 'qty' : 'revenue'
  return [...arr].sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0))
})

onMounted(async () => {
  await auth.fetchMe()
  setPreset('month')
  await load()
})
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <AdminPageHeader 
      title="Аналитика" 
      description="Продажи, заказы, топ, дефицит, скорость отгрузки" 
      icon="📊"
    >
      <template #actions>
        <AdminButton @click="setPreset('week'); load()">Неделя</AdminButton>
        <AdminButton @click="setPreset('month'); load()">Месяц</AdminButton>
        <AdminButton @click="setPreset('quarter'); load()">Квартал</AdminButton>
      </template>
    </AdminPageHeader>

    <!-- Filters -->
    <AdminCard>
      <div class="flex flex-wrap items-center gap-3">
        <AdminInput v-model="dateFrom" type="date" icon="calendar" class="w-[180px]" />
        <span class="text-slate-400">—</span>
        <AdminInput v-model="dateTo" type="date" icon="calendar" class="w-[180px]" />
        <AdminInput v-model="city" placeholder="Город (опц.)" class="w-[200px]" />
        <AdminButton variant="primary" @click="load">Применить</AdminButton>
      </div>
    </AdminCard>

    <div v-if="!isAdmin" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
      <span>⚠️</span>
      Доступно только администратору.
    </div>

    <div v-else-if="err" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
      <span>❌</span>
      {{ err }}
    </div>

    <div v-else-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-slate-500">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span>Загрузка аналитики…</span>
      </div>
    </div>

    <template v-else>
      <!-- KPI cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">💰</div>
            <div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Выручка</div>
          </div>
          <div class="text-2xl font-bold text-slate-900 tabular-nums">{{ money(overview?.revenue) }}</div>
          <div class="text-xs text-slate-500 mt-2">Период: {{ overview?.range?.dateFrom }} — {{ overview?.range?.dateTo }}</div>
        </div>

        <div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">📦</div>
            <div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Заказы</div>
          </div>
          <div class="text-2xl font-bold text-slate-900 tabular-nums">{{ overview?.ordersCount ?? 0 }}</div>
          <div class="text-xs text-slate-500 mt-2">Средний чек: <span class="font-medium text-slate-700">{{ money(overview?.avgCheck) }}</span></div>
        </div>

        <div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">⏱️</div>
            <div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">Под заказ</div>
          </div>
          <div class="text-2xl font-bold text-slate-900 tabular-nums">{{ percent(overview?.preorderShare) }}</div>
          <div class="text-xs text-slate-500 mt-2">
            До отгрузки: <span class="font-medium text-slate-700">{{ Math.round((overview?.productionLeadTime?.hours || 0) * 10) / 10 }} ч</span>
          </div>
        </div>
      </div>

      <!-- Stock deficit -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <div class="text-sm font-bold text-slate-800">🧱 Дефицит — заготовки</div>
              <div class="text-xs text-slate-500 mt-1">Порог minQty, учитывая резервы</div>
            </div>
            <NuxtLink to="/admin/warehouse">
              <AdminButton size="sm">Открыть склад</AdminButton>
            </NuxtLink>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">Позиций</div>
              <div class="text-xl font-bold text-slate-900 tabular-nums">{{ overview?.stockDeficit?.blanks?.positions ?? 0 }}</div>
            </div>
            <div class="rounded-xl bg-red-50 border border-red-100 p-4">
              <div class="text-xs text-red-600 uppercase tracking-wide mb-1">Дефицит (шт.)</div>
              <div class="text-xl font-bold text-red-700 tabular-nums">{{ overview?.stockDeficit?.blanks?.deficitUnits ?? 0 }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <div class="text-sm font-bold text-slate-800">📦 Дефицит — готовая продукция</div>
              <div class="text-xs text-slate-500 mt-1">Порог minQty, учитывая резервы</div>
            </div>
            <NuxtLink to="/admin/warehouse">
              <AdminButton size="sm">Открыть склад</AdminButton>
            </NuxtLink>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">Позиций</div>
              <div class="text-xl font-bold text-slate-900 tabular-nums">{{ overview?.stockDeficit?.finished?.positions ?? 0 }}</div>
            </div>
            <div class="rounded-xl bg-red-50 border border-red-100 p-4">
              <div class="text-xs text-red-600 uppercase tracking-wide mb-1">Дефицит (шт.)</div>
              <div class="text-xl font-bold text-red-700 tabular-nums">{{ overview?.stockDeficit?.finished?.deficitUnits ?? 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tops -->
      <AdminCard :padding="false" title="🏆 Топ продаж">
        <template #header-actions>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Сортировка:</span>
            <AdminButton 
              size="sm" 
              :variant="sortTop === 'revenue' ? 'primary' : 'secondary'"
              @click="sortTop = 'revenue'"
            >
              💰 Выручка
            </AdminButton>
            <AdminButton 
              size="sm" 
              :variant="sortTop === 'qty' ? 'primary' : 'secondary'"
              @click="sortTop = 'qty'"
            >
              📊 Кол-во
            </AdminButton>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div class="p-5">
            <div class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4">Товары</div>
            <div v-if="!topProductsSorted.length" class="text-sm text-slate-500 py-4 text-center">Нет данных</div>
            <div v-else class="space-y-2">
              <div
                v-for="(p, idx) in topProductsSorted"
                :key="p.productId"
                class="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors"
              >
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-slate-900 truncate">
                    <span class="text-slate-400 mr-1">{{ idx + 1 }}.</span>
                    {{ p.name }}
                  </div>
                  <div class="text-xs text-slate-500 mt-1 truncate">{{ p.article }} · {{ p.categoryName || 'Без категории' }}</div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-sm font-bold text-emerald-600 tabular-nums">{{ money(p.revenue) }}</div>
                  <div class="text-xs text-slate-500 tabular-nums mt-1">{{ p.qty }} шт.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-5">
            <div class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4">Категории</div>
            <div v-if="!topCategoriesSorted.length" class="text-sm text-slate-500 py-4 text-center">Нет данных</div>
            <div v-else class="space-y-2">
              <div
                v-for="(c, idx) in topCategoriesSorted"
                :key="String(c.categoryId) + '-' + idx"
                class="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors"
              >
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-slate-900 truncate">
                    <span class="text-slate-400 mr-1">{{ idx + 1 }}.</span>
                    {{ c.categoryName }}
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-sm font-bold text-emerald-600 tabular-nums">{{ money(c.revenue) }}</div>
                  <div class="text-xs text-slate-500 tabular-nums mt-1">{{ c.qty }} шт.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminCard>
    </template>
  </section>
</template>
