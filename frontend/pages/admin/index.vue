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
const isManager = computed(() => auth.user?.role === 'manager')

const loading = ref(false)
const err = ref<string>('')

// Операционная сводка (админ/менеджер)
const dashboard = ref<any>(null)

const dateFrom = ref('')
const dateTo = ref('')

const attentionNow = computed(() => dashboard.value?.attentionNow || { counts: {}, top5: [] })

const attentionRows = computed(() => {
  const rows: any[] = []
  const d = dashboard.value

  for (const o of (d?.attention?.deficitOrders || [])) {
    rows.push({
      kind: 'deficit_order',
      id: o.id,
      title: `Заказ #${o.id}`,
      subtitle: 'Дефицит / ждёт склад',
      createdAt: o.createdAt,
      payload: o,
    })
  }

  for (const t of (d?.attention?.overdueTasks || [])) {
    rows.push({
      kind: 'overdue_task',
      id: t.id,
      title: `Задача #${t.id} · Заказ #${t.orderId}`,
      subtitle: 'Просрочено производство',
      createdAt: t.updatedAt || t.createdAt,
      payload: t,
    })
  }

  for (const o of (d?.attention?.lateShipOrders || [])) {
    rows.push({
      kind: 'late_ship',
      id: o.id,
      title: `Заказ #${o.id}`,
      subtitle: 'Отгрузка просрочена',
      createdAt: o.createdAt,
      payload: o,
    })
  }

  // newest first
  return rows
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30)
})

async function markShipped(orderId: number) {
  if (!auth.accessToken) return
  await api<any>(`/api/ops/orders/${orderId}/status`, {
    method: 'PATCH',
    body: { status: 'shipped', warehouse: 'FINISHED' },
  })
  await loadDashboard()
}

function fmtDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function setPreset(preset: 'today' | 'week' | 'month') {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  if (preset === 'today') {
    // today
  } else if (preset === 'week') {
    start.setDate(start.getDate() - 6)
  } else {
    start.setDate(start.getDate() - 29)
  }

  dateFrom.value = fmtDate(start)
  dateTo.value = fmtDate(end)
}

async function loadDashboard() {
  if (!isAdmin.value && !isManager.value) return
  loading.value = true
  err.value = ''
  try {
    dashboard.value = await api<any>('/api/ops/dashboard', {
      query: {
        dateFrom: dateFrom.value || undefined,
        dateTo: dateTo.value || undefined,
        warehouse: 'FINISHED',
      },
    } as any)
  } catch (e: any) {
    err.value = e?.data?.message || e?.message || 'Не удалось загрузить сводку'
  } finally {
    loading.value = false
  }
}

// helper: allow passing options to api
async function api<T>(path: string, opts?: any) {
  if (!auth.accessToken) throw new Error('Нет токена')
  return await $fetch<T>(path, {
    baseURL: apiBaseUrl.value,
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    ...(opts || {}),
  })
}

onMounted(async () => {
  await auth.fetchMe()
  setPreset('today')
  await loadDashboard()
})
</script>

<template>
  <section class="space-y-6">
      <!-- ADMIN DASHBOARD -->
      <template v-if="isAdmin">
        <!-- Header -->
        <AdminPageHeader 
          title="Дэшборд" 
          description="Операционная сводка: что горит и куда идти" 
          icon="🏠"
        >
          <template #actions>
            <NuxtLink to="/admin/db">
              <AdminButton>🧨 DB Viewer</AdminButton>
            </NuxtLink>
          </template>
        </AdminPageHeader>

        <!-- Filters Card -->
        <AdminCard>
          <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button class="px-4 py-2 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors" @click="setPreset('today'); loadDashboard()">Сегодня</button>
              <button class="px-4 py-2 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors" @click="setPreset('week'); loadDashboard()">Неделя</button>
              <button class="px-4 py-2 hover:bg-slate-50 text-sm font-medium transition-colors" @click="setPreset('month'); loadDashboard()">Месяц</button>
            </div>

            <AdminInput v-model="dateFrom" type="date" icon="calendar" />
            <span class="text-slate-400">—</span>
            <AdminInput v-model="dateTo" type="date" icon="calendar" />
            <AdminButton variant="primary" @click="loadDashboard">Применить</AdminButton>
          </div>
        </AdminCard>

        <div v-if="err" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <span>❌</span>
          {{ err }}
        </div>
        <div v-else-if="loading" class="flex items-center justify-center py-12">
          <div class="flex items-center gap-3 text-slate-500">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>Загрузка…</span>
          </div>
        </div>

        <!-- 1) Что требует внимания сейчас -->
        <div class="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent">
            <div>
              <div class="text-base font-semibold text-slate-800">🔥 Что требует внимания сейчас</div>
              <div class="text-xs text-slate-500 mt-1">3 ключевых счётчика + топ-5 самых срочных.</div>
            </div>
            <button class="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors" @click="loadDashboard">
              🔄 Обновить
            </button>
          </div>

          <div class="p-5 space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <NuxtLink
                :to="{ path: '/admin/orders', query: { status: 'in_work', overdue: '1' } }"
                class="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg hover:border-red-200 hover:from-red-50 hover:to-white transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">⏰</div>
                  <div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide font-medium">Просроченные заказы</div>
                    <div class="mt-1 text-3xl font-bold tabular-nums text-slate-900">{{ attentionNow.counts?.overdueOrders ?? 0 }}</div>
                  </div>
                </div>
              </NuxtLink>

              <NuxtLink
                :to="{ path: '/admin/warehouse', query: { tab: 'blanks', belowMin: '1' } }"
                class="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg hover:border-amber-200 hover:from-amber-50 hover:to-white transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📦</div>
                  <div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide font-medium">Дефицит склада</div>
                    <div class="mt-1 text-3xl font-bold tabular-nums text-slate-900">{{ attentionNow.counts?.belowMinPositions ?? 0 }}</div>
                  </div>
                </div>
              </NuxtLink>

              <NuxtLink
                :to="{ path: '/admin/settings', query: { tab: 'system' } }"
                class="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg hover:border-blue-200 hover:from-blue-50 hover:to-white transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">⚠️</div>
                  <div>
                    <div class="text-xs text-slate-500 uppercase tracking-wide font-medium">Ошибки системы</div>
                    <div class="mt-1 text-3xl font-bold tabular-nums text-slate-900">{{ attentionNow.counts?.systemErrorsNew ?? 0 }}</div>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <div class="rounded-2xl border border-slate-200 overflow-hidden">
              <div class="px-4 py-3 bg-gradient-to-r from-slate-50 to-transparent text-xs text-slate-600 font-semibold uppercase tracking-wide">Топ 5 срочных</div>
              <div v-if="(attentionNow.top5 || []).length" class="divide-y divide-slate-100">
                <NuxtLink
                  v-for="(it, idx) in attentionNow.top5"
                  :key="idx"
                  :to="it.href"
                  class="block px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div class="text-sm font-medium text-slate-800">{{ it.title }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">{{ it.subtitle }}</div>
                </NuxtLink>
              </div>
              <div v-else class="px-4 py-8 text-center text-sm text-slate-500">Пока всё спокойно 🎉</div>
            </div>
          </div>
        </div>

        <!-- Требует внимания (операционка) -->
        <div class="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent">
            <div>
              <div class="text-base font-semibold text-slate-800">📋 Требует внимания</div>
              <div class="text-xs text-slate-500 mt-1">Дефициты, просрочки производства, отгрузки.</div>
            </div>
            <button class="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors" @click="loadDashboard">🔄 Обновить</button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
                <tr>
                  <th class="text-left px-4 py-3 font-semibold">Тип</th>
                  <th class="text-left px-4 py-3 font-semibold">Объект</th>
                  <th class="text-left px-4 py-3 font-semibold">Дата</th>
                  <th class="text-left px-4 py-3 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in attentionRows" :key="`${r.kind}-${r.id}`" class="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
                      {{ r.subtitle }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="font-semibold text-slate-800">{{ r.title }}</div>
                    <div v-if="r.kind === 'deficit_order'" class="text-xs text-slate-500">Статус: {{ r.payload?.status }}</div>
                    <div v-if="r.kind === 'overdue_task'" class="text-xs text-slate-500">Товар ID: {{ r.payload?.productId }} · Кол-во: {{ r.payload?.qty }}</div>
                    <div v-if="r.kind === 'late_ship'" class="text-xs text-gray-500">Статус: {{ r.payload?.status }}</div>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500 tabular-nums">
                    {{ new Date(r.createdAt).toLocaleString('ru-RU') }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-2">
                      <NuxtLink
                        v-if="r.kind === 'deficit_order' || r.kind === 'late_ship'"
                        :to="{ path: '/admin/orders', query: { q: String(r.id) } }"
                        class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                      >К заказу</NuxtLink>

                      <NuxtLink
                        v-if="r.kind === 'deficit_order' || r.kind === 'overdue_task'"
                        :to="{ path: '/admin/production', query: { orderId: String(r.payload?.orderId || r.id) } }"
                        class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                      >В производство</NuxtLink>

                      <button
                        v-if="r.kind === 'late_ship'"
                        class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                        @click="markShipped(r.id)"
                      >Пометить отгружено</button>
                    </div>
                  </td>
                </tr>

                <tr v-if="attentionRows.length === 0">
                  <td colspan="4" class="px-4 py-8 text-center text-gray-500">Пока всё спокойно 🎉</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- KPI -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <NuxtLink :to="{ path: '/admin/orders' }" class="rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50">
            <div class="text-xs text-gray-500">Заказы</div>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">Всего</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.orders?.total ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">Новые</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.orders?.new ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">В работе</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.orders?.inWork ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">Ждут склад</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.orders?.waitingWarehouse ?? '—' }}</span>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink :to="{ path: '/admin/orders', query: { status: 'in_work' } }" class="rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50">
            <div class="text-xs text-gray-500">Отгрузки</div>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">Готово к отгрузке</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.shipments?.readyToShip ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">Отгружено сегодня</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.shipments?.shippedToday ?? '—' }}</span>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-3">Клик → заказы</div>
          </NuxtLink>

          <NuxtLink :to="{ path: '/admin/warehouse' }" class="rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50">
            <div class="text-xs text-gray-500">Склад ({{ dashboard?.range?.warehouse || 'FINISHED' }})</div>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">Позиций в дефиците</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.stocks?.deficitPositions ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">Критично</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.stocks?.criticalPositions ?? '—' }}</span>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-3">Клик → склад</div>
          </NuxtLink>

          <NuxtLink :to="{ path: '/admin/production' }" class="rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50">
            <div class="text-xs text-gray-500">Производство</div>
            <div class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">В работе</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.production?.inWork ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-700">Просрочено</span>
                <span class="tabular-nums font-semibold">{{ dashboard?.kpi?.production?.overdue ?? '—' }}</span>
              </div>
            </div>
            <div class="text-xs text-gray-500 mt-3">Клик → производство</div>
          </NuxtLink>
        </div>
      </template>

      <!-- MANAGER LIGHT DASHBOARD -->
      <template v-else-if="isManager">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 class="text-2xl font-semibold">Менеджер</h1>
            <p class="text-sm text-gray-600 mt-1">Быстрый доступ к модерации и заказам.</p>
          </div>
          <div class="flex items-center gap-2">
            <NuxtLink to="/admin/stores" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95">🏪 Магазины</NuxtLink>
            <NuxtLink to="/admin/orders" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">🧾 Заказы</NuxtLink>
            <NuxtLink to="/admin/in-work" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">🛠️ В работе</NuxtLink>
            <NuxtLink to="/admin/shipments" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">🚚 Отгрузки</NuxtLink>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="text-xs text-gray-500">Модерация</div>
            <div class="mt-1 text-lg font-semibold">Магазины</div>
            <div class="text-sm text-gray-600 mt-2">Смотреть, подтверждать, отклонять.</div>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="text-xs text-gray-500">Операции</div>
            <div class="mt-1 text-lg font-semibold">Заказы</div>
            <div class="text-sm text-gray-600 mt-2">Статусы, обработка, коммуникация.</div>
          </div>
          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="text-xs text-gray-500">Сборка</div>
            <div class="mt-1 text-lg font-semibold">В работе</div>
            <div class="text-sm text-gray-600 mt-2">Сборка и закрытие заказов.</div>
          </div>
        </div>
      </template>

      <template v-else>
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Дэшборд</h1>
          <p class="text-sm text-gray-600 mt-1">
            Быстрый доступ к заказам и набору позиций. Здесь позже появится аналитика и уведомления.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/b2b/quick-order"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
          >
            ⚡ Быстрый заказ
          </NuxtLink>
          <NuxtLink
            to="/b2b/orders"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
          >
            🧾 Заказы
          </NuxtLink>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-xs text-gray-500">Статус</div>
          <div class="mt-1 text-lg font-semibold">Аккаунт магазина</div>
          <div class="text-sm text-gray-600 mt-2">
            Оптовые цены активны. Если не видите опт — обновите профиль в аккаунте.
          </div>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-xs text-gray-500">Заказы</div>
          <div class="mt-1 text-lg font-semibold">История и повтор</div>
          <div class="text-sm text-gray-600 mt-2">
            Список заказов магазина, статусы, повтор заказа одной кнопкой.
          </div>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-xs text-gray-500">Набор</div>
          <div class="mt-1 text-lg font-semibold">Быстрый ввод</div>
          <div class="text-sm text-gray-600 mt-2">
            Табличный интерфейс: артикул → количество, плюс импорт списком.
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">Быстрый старт</div>
              <div class="text-xs text-gray-500 mt-1">То, что обычно нужно магазину каждый день</div>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <NuxtLink to="/b2b/quick-order" class="rounded-xl border border-gray-200 hover:bg-gray-100 p-3">
              <div class="text-sm font-medium">⚡ Создать заказ</div>
              <div class="text-xs text-gray-500 mt-1">Набрать позиции по артикулам</div>
            </NuxtLink>
            <NuxtLink to="/b2b/orders" class="rounded-xl border border-gray-200 hover:bg-gray-100 p-3">
              <div class="text-sm font-medium">🧾 Посмотреть заказы</div>
              <div class="text-xs text-gray-500 mt-1">Статусы, повтор, выгрузки</div>
            </NuxtLink>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold">Что дальше (v0.2.x)</div>
          <ul class="mt-3 space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2"><span class="mt-1">•</span><span>Остатки по складам / группам складов</span></li>
            <li class="flex items-start gap-2"><span class="mt-1">•</span><span>Шаблоны заказов и импорт «артикул;кол-во»</span></li>
            <li class="flex items-start gap-2"><span class="mt-1">•</span><span>Индивидуальные цены и выбор ценовой группы</span></li>
          </ul>
        </div>
      </div>
      </template>
    </section></template>
