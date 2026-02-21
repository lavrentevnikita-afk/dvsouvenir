<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useDebounce } from '~/composables/useAdminUtils'
// Экспорт состава заказа в .csv
function exportOrderLinesCsv() {
  // detail.lines или detail.order.lines (универсально)
  const lines = (detail.value?.lines || detail.value?.order?.lines) ?? []
  if (!Array.isArray(lines) || !lines.length) return
  const headers = ['Наименование', 'Количество', 'Цена за штуку']
  const rows = lines.map((l: any) => [
    l.name || l.productName || l.article || '',
    l.quantity,
    l.price
  ].map((v) => {
    const s = (v === null || typeof v === 'undefined') ? '' : String(v)
    return /[\n\r",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }).join(','))
  // Добавляем BOM для Excel
  const BOM = '\uFEFF'
  const csv = BOM + [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `order_${detail.value?.id || detail.value?.order?.id || 'unknown'}_lines.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

definePageMeta({ layout: 'admin', middleware: ['staff'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

// --- filters (top panel) ---
const route = useRoute()
const q = ref('')
const debouncedQ = useDebounce(q, 300) // debounced search
const status = ref<'all' | 'new' | 'confirmed' | 'in_work' | 'needs_materials' | 'shipped' | 'closed'>('all')
const store = ref<'all' | string>('all')
const problematic = ref(false)
const overdue = ref(false)
const dateFrom = ref<string>('')
const dateTo = ref<string>('')

// --- pagination ---
const page = ref(1)
const perPage = ref(20)

// --- data ---
const loading = ref(false)
const error = ref<string | null>(null)
const orders = ref<any[]>([])
const storeOptions = ref<Array<{ value: string; label: string }>>([])

// --- computed pagination ---
const totalItems = computed(() => orders.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value) || 1)
const paginatedOrders = computed(() => {
  const start = (page.value - 1) * perPage.value
  return orders.value.slice(start, start + perPage.value)
})

// --- selection / bulk ---
const selected = ref<Record<number, boolean>>({})
const bulkAction = ref<'accept' | 'cancel' | 'to_production' | 'ready_to_ship' | 'ship' | ''>('')

const selectedIds = computed(() => Object.keys(selected.value).filter((k) => selected.value[Number(k)]).map((k) => Number(k)))

function presetToday() {
  const d = new Date()
  const s = d.toISOString().slice(0, 10)
  dateFrom.value = s
  dateTo.value = s
}

function presetWeek() {
  const now = new Date()
  const from = new Date(now)
  from.setDate(now.getDate() - 6)
  dateFrom.value = from.toISOString().slice(0, 10)
  dateTo.value = now.toISOString().slice(0, 10)
}

function presetMonth() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  dateFrom.value = from.toISOString().slice(0, 10)
  dateTo.value = now.toISOString().slice(0, 10)
}

function humanDate(dt: any) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString()
}

const statusLabel: Record<string, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  in_work: 'В работе',
  needs_materials: 'Нужны материалы',
  shipped: 'Отгружен',
  closed: 'Закрыт',
}

const whLabel: Record<string, string> = {
  ok: 'OK',
  partial: 'Частично',
  deficit: 'Дефицит',
}

const prodLabel: Record<string, string> = {
  not_needed: 'Не нужно',
  planned: 'Запланировано',
  in_work: 'В работе',
  ready: 'Готово',
}

function lineByProductId(pid: number) {
  return (detail.value?.lines || []).find((l: any) => Number(l.productId) === Number(pid))
}

const shipLabel: Record<string, string> = {
  not_ready: 'Не готово',
  ready: 'Готово',
  shipped: 'Отгружено',
}

async function loadStores() {
  if (!auth.accessToken) return
  try {
    const res = await $fetch<any>('/api/admin/shops', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: { status: undefined },
    })
    const list = Array.isArray(res?.shops) ? res.shops : []
    storeOptions.value = list.map((s: any) => ({
      value: `shop:${s.id}`,
      label: `${(s.displayName || s.companyName || 'Магазин')}${s.city ? ' · ' + s.city : ''}`,
    }))
  } catch {
    storeOptions.value = []
  }
}

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/ops/orders', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: {
        q: q.value || undefined,
        status: status.value === 'all' ? undefined : status.value,
        store: store.value === 'all' ? undefined : store.value,
        problematic: problematic.value ? '1' : undefined,
        overdue: overdue.value ? '1' : undefined,
        dateFrom: dateFrom.value ? new Date(dateFrom.value).toISOString() : undefined,
        dateTo: dateTo.value ? new Date(dateTo.value + 'T23:59:59.999Z').toISOString() : undefined,
      },
    })
    orders.value = Array.isArray(res?.orders) ? res.orders : []
    // сбрасываем выбор, если список изменился
    const keep: Record<number, boolean> = {}
    for (const o of orders.value) if (selected.value[o.id]) keep[o.id] = true
    selected.value = keep
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить заказы'
  } finally {
    loading.value = false
  }
}

function toggleAll(v: boolean) {
  const map: Record<number, boolean> = {}
  for (const o of orders.value) map[o.id] = v
  selected.value = map
}

function exportCsv() {
  const headers = ['id', 'createdAt', 'store', 'customerName', 'phone', 'email', 'totalPrice', 'status', 'warehouseStatus', 'productionStatus', 'shipmentStatus']
  const rows = orders.value.map((o) => headers.map((h) => {
    const val = o[h]
    const s = (val === null || typeof val === 'undefined') ? '' : String(val)
    // CSV escape
    return /[\n\r",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// --- drawer (order card) ---
const drawerOpen = ref(false)
const drawerLoading = ref(false)
const drawerError = ref<string | null>(null)
const activeId = ref<number | null>(null)
const detail = ref<any | null>(null)
const drawerComment = ref('')
const allocations = ref<any[]>([])
const allocationsLoading = ref(false)

const allocationByProductId = computed(() => {
  const map: Record<number, { finished: number; blanks: number }> = {}
  for (const a of allocations.value) {
    const pid = Number(a?.productId)
    if (!pid) continue
    if (!map[pid]) map[pid] = { finished: 0, blanks: 0 }
    const qty = Number(a?.qty || 0)
    if (a?.status !== 'active') continue
    if (a?.kind === 'FINISHED') map[pid].finished += qty
    if (a?.kind === 'BLANKS') map[pid].blanks += qty
  }
  return map
})

// Этап 5: отгружать можно только если FINISHED reserved == required
const canReadyToShip = computed(() => {
  if (!detail.value) return false
  const lines = Array.isArray(detail.value?.lines) ? detail.value.lines : []
  if (!lines.length) return false
  return lines.every((l: any) => (allocationByProductId.value[Number(l.productId)]?.finished || 0) >= (Number(l.quantity) || 0))
})

async function loadAllocations(id: number) {
  if (!auth.accessToken) return
  allocationsLoading.value = true
  try {
    const res = await $fetch<any>(`/api/ops/orders/${id}/allocations`, {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    allocations.value = Array.isArray(res?.allocations) ? res.allocations : []
  } catch {
    allocations.value = []
  } finally {
    allocationsLoading.value = false
  }
}

async function openOrder(id: number) {
  if (!auth.accessToken) return
  drawerOpen.value = true
  drawerLoading.value = true
  drawerError.value = null
  activeId.value = id
  try {
    detail.value = await $fetch<any>(`/api/ops/orders/${id}`, {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    await loadAllocations(id)
  } catch (e: any) {
    drawerError.value = e?.data?.message || 'Не удалось открыть заказ'
  } finally {
    drawerLoading.value = false
  }
}

function closeDrawer() {
  drawerOpen.value = false
  activeId.value = null
  detail.value = null
  drawerComment.value = ''
  allocations.value = []
}

async function allocateOne(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/allocate`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })
  await load()
  if (activeId.value === id) await openOrder(id)
}

async function releaseOne(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/release`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })
  await load()
  if (activeId.value === id) await openOrder(id)
}

async function acceptOne(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/accept`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { warehouse: 'FINISHED' },
  })
  await load()
  if (activeId.value === id) await openOrder(id)
}

async function cancelOne(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/cancel`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })
  await load()
  if (activeId.value === id) await openOrder(id)
}

async function deleteOne(id: number) {
  if (!auth.accessToken) return
  const phrase = window.prompt('Удаление необратимо. Введи YES_DELETE чтобы продолжить:')
  if (String(phrase || '').trim() !== 'YES_DELETE') return
  const ok = window.confirm(`Точно удалить заказ #${id}?`)
  if (!ok) return
  await $fetch(`/api/ops/orders/${id}`, {
    baseURL: apiBaseUrl,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { confirm: 'YES_DELETE' },
  })
  drawerOpen.value = false
  await load()
}

async function toProduction(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/production`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { warehouse: 'FINISHED' },
  })
  await load()
  if (activeId.value === id) await openOrder(id)
}

async function createShipment(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/shipment`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })
  if (activeId.value === id) await openOrder(id)
}

async function shipOne(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/ship`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })
  await load()
  if (activeId.value === id) await openOrder(id)
}

async function addDrawerComment() {
  const id = activeId.value
  if (!id || !auth.accessToken) return
  const text = drawerComment.value.trim()
  if (!text) return
  await $fetch(`/api/ops/orders/${id}/comments`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { text },
  })
  drawerComment.value = ''
  await openOrder(id)
}

async function runBulk() {
  const ids = selectedIds.value
  if (!ids.length || !bulkAction.value) return
  // без фоновых задач — просто по очереди
  for (const id of ids) {
    if (bulkAction.value === 'accept') await acceptOne(id)
    if (bulkAction.value === 'cancel') await cancelOne(id)
    if (bulkAction.value === 'to_production') await toProduction(id)
    if (bulkAction.value === 'ship') await shipOne(id)
    // ready_to_ship — чисто логический статус в текущей модели; оставляем как no-op
  }
  bulkAction.value = ''
}

watch([debouncedQ, status, store, problematic, overdue, dateFrom, dateTo], () => {
  page.value = 1 // reset pagination on filter change
  load()
})

watch(
  () => route.query,
  (qry) => {
    const s = String(qry?.status || '').trim()
    const qq = String(qry?.q || '').trim()
    if (s && ['new', 'confirmed', 'in_work', 'needs_materials', 'shipped', 'closed', 'all'].includes(s)) status.value = s as any
    if (typeof qry?.q !== 'undefined') q.value = qq
    overdue.value = String(qry?.overdue || '').toLowerCase() === '1' || String(qry?.overdue || '').toLowerCase() === 'true'
  },
  { immediate: true },
)

onMounted(async () => { await loadStores(); await load(); })

const breadcrumbs = [
  { label: 'Заказы', to: '/admin/orders', icon: '📦' }
]
</script>

<template>
  <section class="space-y-6">
    <AdminBreadcrumbs :items="breadcrumbs" />

    <!-- Header -->
    <AdminPageHeader 
      title="Заказы" 
      description="Обработка заказов: статусы склада/производства/отгрузки + массовые действия" 
      icon="📋"
    >
      <template #actions>
        <AdminButton @click="exportCsv">Экспорт</AdminButton>
        <AdminButton variant="primary" @click="load">Обновить</AdminButton>
      </template>
    </AdminPageHeader>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
      <span>❌</span>
      {{ error }}
    </div>

    <!-- top panel -->
    <AdminCard>
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 flex-1">
          <AdminInput v-model="q" placeholder="Поиск: номер / телефон / артикул" icon="search" />

          <AdminSelect 
            v-model="status" 
            :options="[
              { value: 'all', label: 'Все статусы' },
              { value: 'new', label: 'Новые' },
              { value: 'confirmed', label: 'Подтверждённые' },
              { value: 'in_work', label: 'В работе' },
              { value: 'needs_materials', label: 'Нужны материалы' },
              { value: 'shipped', label: 'Отгруженные' },
              { value: 'closed', label: 'Закрытые' },
            ]"
          />

          <AdminSelect 
            v-model="store" 
            :options="[{ value: 'all', label: 'Все магазины' }, { value: 'Сайт', label: 'Сайт' }, ...storeOptions]"
          />

          <div class="flex gap-2">
            <label class="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex-1">
              <input v-model="problematic" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
              <span class="text-slate-700">Проблемные</span>
            </label>

            <label class="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex-1">
              <input v-model="overdue" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
              <span class="text-slate-700">Просроченные</span>
            </label>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex gap-2">
            <AdminInput v-model="dateFrom" type="date" icon="calendar" />
            <AdminInput v-model="dateTo" type="date" icon="calendar" />
          </div>
          <div class="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <button class="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors" @click="presetToday">Сегодня</button>
            <button class="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors" @click="presetWeek">Неделя</button>
            <button class="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium transition-colors" @click="presetMonth">Месяц</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
        <div class="text-sm text-slate-600">
          Найдено: <span class="font-bold text-slate-900">{{ orders.length }}</span>
          <span v-if="selectedIds.length" class="ml-2 px-2 py-0.5 bg-slate-900 text-white rounded-lg text-xs">Выбрано: {{ selectedIds.length }}</span>
        </div>
        <div class="flex items-center gap-2">
          <AdminSelect 
            v-model="bulkAction" 
            :options="[
              { value: '', label: 'Массовые действия…' },
              { value: 'accept', label: 'Принять' },
              { value: 'cancel', label: 'Отменить' },
              { value: 'to_production', label: 'В производство' },
              { value: 'ship', label: 'Пометить отгружено' },
            ]"
          />
          <AdminButton
            :disabled="!selectedIds.length || !bulkAction"
            @click="runBulk"
          >
            Применить
          </AdminButton>
        </div>
      </div>
    </AdminCard>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-slate-500">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span>Загрузка заказов…</span>
      </div>
    </div>

    <!-- table -->
    <div v-else class="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th class="text-left px-4 py-3 w-[48px]">
                <input
                  type="checkbox"
                  class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                  :checked="orders.length && selectedIds.length === orders.length"
                  @change="toggleAll(($event.target as HTMLInputElement).checked)"
                />
              </th>
              <th class="text-left px-4 py-3 font-semibold">№ / дата</th>
              <th class="text-left px-4 py-3 font-semibold">Магазин / клиент</th>
              <th class="text-left px-4 py-3 font-semibold">Сумма</th>
              <th class="text-left px-4 py-3 font-semibold">Статус</th>
              <th class="text-left px-4 py-3 font-semibold">Склад</th>
              <th class="text-left px-4 py-3 font-semibold">Производство</th>
              <th class="text-left px-4 py-3 font-semibold">Отгрузка</th>
              <th class="text-left px-4 py-3 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in paginatedOrders" :key="o.id" class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
              <td class="px-4 py-3.5 align-top">
                <input v-model="selected[o.id]" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
              </td>
              <td class="px-4 py-3.5 align-top">
                <div class="font-bold text-slate-900">#{{ o.id }}</div>
                <div class="text-xs text-gray-500">{{ humanDate(o.createdAt) }}</div>
              </td>
              <td class="px-4 py-3 align-top">
                <div class="text-xs text-gray-500">{{ o.store || '—' }}<span v-if="o.shopCity" class="ml-1 text-gray-400">({{ o.shopCity }})</span></div>
                <div class="font-medium">{{ o.customerName }}</div>
                <div class="text-xs text-gray-500">{{ o.phone || '—' }} · {{ o.email }}</div>
              </td>
              <td class="px-4 py-3 align-top">{{ o.totalPrice }} ₽</td>
              <td class="px-4 py-3 align-top">
                <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                  {{ statusLabel[o.status] || o.status }}
                </span>
              </td>
              <td class="px-4 py-3 align-top">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                  :class="o.warehouseStatus === 'deficit' ? 'bg-red-50 text-red-700 border-red-200' : o.warehouseStatus === 'partial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'"
                >
                  {{ whLabel[o.warehouseStatus] || o.warehouseStatus }}
                </span>
              </td>
              <td class="px-4 py-3 align-top">
                <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                  {{ prodLabel[o.productionStatus] || o.productionStatus }}
                </span>
              </td>
              <td class="px-4 py-3 align-top">
                <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                  {{ shipLabel[o.shipmentStatus] || o.shipmentStatus }}
                </span>
              </td>
              <td class="px-4 py-3 align-top">
                <div class="flex flex-wrap gap-2">
                  <button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs" @click="openOrder(o.id)">
                    Открыть
                  </button>
                  <button
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                    @click="acceptOne(o.id)"
                  >
                    Принять
                  </button>
                  <button
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                    @click="toProduction(o.id)"
                  >
                    В производство
                  </button>
                  <button
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                    @click="shipOne(o.id)"
                  >
                    Отгружено
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="orders.length === 0">
              <td colspan="9" class="px-4 py-10 text-center text-gray-500">Пусто</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <AdminPagination
        v-if="totalPages > 1"
        v-model:page="page"
        :total-pages="totalPages"
        :total-items="totalItems"
        :per-page="perPage"
      />
    </div>

    <!-- Drawer -->
    <div v-if="drawerOpen" class="fixed inset-0 z-[1100]">
      <div class="absolute inset-0 bg-black/30" @click="closeDrawer" />
      <div class="absolute right-0 top-0 h-full w-full max-w-[680px] bg-white shadow-xl border-l border-gray-200">
        <div class="h-full flex flex-col">
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <div class="text-sm text-gray-500">Карточка заказа</div>
              <div class="text-xl font-semibold" v-if="activeId">#{{ activeId }}</div>
            </div>
            <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="closeDrawer">Закрыть</button>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            <div v-if="drawerError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {{ drawerError }}
            </div>

            <div v-if="drawerLoading" class="text-sm text-gray-500">Загрузка…</div>

            <template v-else-if="detail">
              <div class="rounded-2xl border border-gray-200 bg-white p-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div class="text-xs text-gray-500">Клиент</div>
                    <div class="font-semibold">{{ detail.order.customerName }}</div>
                    <div class="text-sm text-gray-600">{{ detail.order.phone || '—' }} · {{ detail.order.email }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">Адрес</div>
                    <div class="text-sm text-gray-800">{{ detail.order.address }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">Статус</div>
                    <div class="text-sm font-semibold">{{ statusLabel[detail.order.status] || detail.order.status }}</div>
                    <div class="text-xs text-gray-500">{{ humanDate(detail.order.createdAt) }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">Сумма</div>
                    <div class="text-sm font-semibold">{{ detail.order.totalPrice }} ₽</div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2 mt-4">
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="allocateOne(detail.order.id)">Зарезервировать</button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="releaseOne(detail.order.id)">Снять резерв</button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="acceptOne(detail.order.id)">Подтвердить</button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="toProduction(detail.order.id)">Создать производство</button>
                  <button
                    class="px-3 py-2 rounded-xl border text-sm"
                    :class="canReadyToShip ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-200/60 text-gray-400 cursor-not-allowed bg-gray-50'"
                    :disabled="!canReadyToShip"
                    @click="createShipment(detail.order.id)"
                  >
                    Готов к отгрузке
                  </button>
                  <button
                    class="px-3 py-2 rounded-xl border text-sm"
                    :class="canReadyToShip ? 'border-gray-200 hover:bg-gray-100' : 'border-gray-200/60 text-gray-400 cursor-not-allowed bg-gray-50'"
                    :disabled="!canReadyToShip"
                    @click="shipOne(detail.order.id)"
                  >
                    Отгрузить
                  </button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="cancelOne(detail.order.id)">Отменить</button>
                  <button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm" @click="deleteOne(detail.order.id)">Удалить</button>
                </div>
              </div>

              <!-- allocations -->
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div class="flex justify-end p-2">
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="exportOrderLinesCsv()">
                    Экспорт .csv
                  </button>
                </div>
                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div class="text-sm font-semibold">Комплектация</div>
                  <div class="text-xs text-gray-500" v-if="allocationsLoading">обновление…</div>
                </div>
                <div class="p-4 space-y-3">
                  <div v-for="l in detail.lines" :key="'a'+l.productId" class="rounded-xl border border-gray-200 p-3">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="font-medium">{{ l.name }}</div>
                        <div class="text-xs text-gray-500 mt-1">Нужно: {{ l.quantity }}</div>
                      </div>
                      <div class="text-right">
                        <div class="text-xs text-gray-500">FINISHED</div>
                        <div class="font-semibold tabular-nums">{{ allocationByProductId[l.productId]?.finished || 0 }} / {{ l.quantity }}</div>
                        <div class="text-xs text-gray-500 mt-2">BLANKS</div>
                        <div class="font-semibold tabular-nums">{{ allocationByProductId[l.productId]?.blanks || 0 }} / {{ Math.max(0, l.quantity - (allocationByProductId[l.productId]?.finished || 0)) }}</div>
                      </div>
                    </div>

                    <div class="mt-2 text-xs">
                      <span v-if="(allocationByProductId[l.productId]?.finished || 0) >= l.quantity" class="text-green-700">✅ Готово</span>
                      <span v-else-if="(allocationByProductId[l.productId]?.finished || 0) + (allocationByProductId[l.productId]?.blanks || 0) >= l.quantity" class="text-amber-700">⚠️ Нужна производство</span>
                      <span v-else class="text-red-700">❌ Не хватает материалов</span>
                    </div>
                  </div>

                  <div v-if="detail?.order?.allocationIssues && detail.order.allocationIssues.length" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    <div class="font-semibold mb-1">Причины:</div>
                    <ul class="list-disc pl-5 space-y-1">
                      <li v-for="(i, idx) in detail.order.allocationIssues" :key="idx">{{ i.message || i.code }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- items -->
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div class="text-sm font-semibold">Состав заказа</div>
                </div>
                <div class="p-4 overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="text-xs text-gray-500">
                      <tr>
                        <th class="text-left py-2">Позиция</th>
                        <th class="text-left py-2">Кол-во</th>
                        <th class="text-left py-2">Цена</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="l in detail.lines" :key="l.productId" class="border-t border-gray-100">
                        <td class="py-2">
                          <div class="flex items-start justify-between gap-3">
                            <div>
                              <div class="font-medium">{{ l.name }}</div>
                              <div class="mt-1">
                                <ProductLabel :article="l.article" :name="l.name" :imageUrl="l.previewImageUrl" />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="py-2">{{ l.quantity }}</td>
                        <td class="py-2">{{ l.price }} ₽</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- warehouse -->
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div class="text-sm font-semibold">Склад</div>
                </div>
                <div class="p-4 space-y-2">
                  <div v-for="l in detail.lines" :key="'w'+l.productId" class="rounded-xl border border-gray-200 p-3">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <div class="font-medium">{{ l.name }}</div>
                        <div class="mt-1">
                          <ProductLabel :article="l.article" :name="l.name" :imageUrl="l.previewImageUrl" />
                        </div>
                        <div class="text-xs text-gray-500 mt-1">Доступно: {{ l.stock.available }} · Резерв: {{ l.stock.reservedQty }} · Остаток: {{ l.stock.qty }}</div>
                      </div>
                      <span
                        class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                        :class="l.stock.available >= l.quantity ? 'bg-green-50 text-green-700 border-green-200' : l.stock.available > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'"
                      >
                        {{ l.stock.available >= l.quantity ? 'OK' : l.stock.available > 0 ? 'Частично' : 'Дефицит' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- production -->
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div class="text-sm font-semibold">Производство</div>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="toProduction(detail.order.id)">
                    Создать
                  </button>
                </div>
                <div class="p-4 space-y-2">
                  <div v-if="(detail.workOrders || []).length" class="space-y-2">
                    <div class="text-xs text-gray-500">Work Orders</div>
                    <div v-for="wo in (detail.workOrders || [])" :key="'wo'+wo.id" class="rounded-xl border border-gray-200 p-3">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <div class="font-medium">#{{ wo.id }} · {{ wo.product?.name || ('Товар #' + wo.productId) }}</div>
                          <div class="text-xs text-gray-500 mt-1">Готово: {{ wo.qtyDone }} / {{ wo.qtyPlanned }}<span v-if="Number(wo.qtyDefect || 0) > 0"> · брак {{ wo.qtyDefect }}</span></div>
                        </div>
                        <span class="px-2 py-1 rounded-lg border border-gray-200 text-xs">{{ wo.status }}</span>
                      </div>
                    </div>
                    <NuxtLink :to="{ path: '/admin/production', query: { orderId: String(detail.order.id) } }" class="inline-flex items-center text-sm text-gray-900 underline">Открыть производство</NuxtLink>
                  </div>
                  <div v-if="(detail.productionTasks || []).length === 0" class="text-sm text-gray-500">Заданий нет</div>
                  <div v-for="t in (detail.productionTasks || [])" :key="t.id" class="rounded-xl border border-gray-200 p-3">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <div class="font-medium">
                          <span class="mr-2">Задание</span>
                          <span class="inline-flex items-center gap-2">
                            <ProductLabel
                              :article="(detail.lines || []).find((x:any)=>x.productId===t.productId)?.article"
                              :name="(detail.lines || []).find((x:any)=>x.productId===t.productId)?.name"
                              :imageUrl="(detail.lines || []).find((x:any)=>x.productId===t.productId)?.previewImageUrl"
                            />
                            <span class="text-sm text-gray-700">× {{ t.qty }}</span>
                          </span>
                        </div>
                        <div class="text-xs text-gray-500">{{ humanDate(t.createdAt) }}</div>
                      </div>
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                        {{ prodLabel[t.status] || t.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- shipment -->
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div class="text-sm font-semibold">Отгрузка</div>
                  <div class="flex gap-2">
                    <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="createShipment(detail.order.id)">
                      Создать
                    </button>
                    <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="shipOne(detail.order.id)">
                      Подтвердить
                    </button>
                  </div>
                </div>
                <div class="p-4">
                  <div v-if="!detail.shipment" class="text-sm text-gray-500">Отгрузка еще не создана</div>
                  <div v-else class="rounded-xl border border-gray-200 p-3">
                    <div class="font-medium">#{{ detail.shipment.id }}</div>
                    <div class="text-xs text-gray-500">Создано: {{ humanDate(detail.shipment.createdAt) }}</div>
                    <div class="text-xs text-gray-500" v-if="detail.shipment.shippedAt">Отгружено: {{ humanDate(detail.shipment.shippedAt) }}</div>
                    <div class="mt-2">
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                        {{ detail.shipment.status === 'shipped' ? 'Отгружено' : 'Не отгружено' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- comments + history -->
              <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div class="text-sm font-semibold">Комментарий + история</div>
                </div>
                <div class="p-4 space-y-3">
                  <div class="rounded-xl border border-gray-200 p-3">
                    <div class="text-xs text-gray-500 mb-2">Внутренний комментарий</div>
                    <textarea
                      v-model="drawerComment"
                      rows="3"
                      class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                      placeholder="Комментарий для менеджеров"
                    />
                    <div class="flex justify-end mt-2">
                      <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="addDrawerComment">Сохранить</button>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div v-for="(h, idx) in (detail.history || [])" :key="idx" class="rounded-xl border border-gray-200 bg-white px-3 py-2">
                      <div class="text-xs text-gray-500">{{ humanDate(h.at) }}</div>
                      <div class="text-sm">{{ h.text }}</div>
                    </div>
                    <div v-if="(detail.history || []).length === 0" class="text-sm text-gray-500">История пуста</div>
                  </div>
                </div>
              </div>
            </template>

            <div v-else class="text-sm text-gray-500">Нет данных</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
