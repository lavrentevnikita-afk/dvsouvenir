<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'b2b', middleware: ['b2b', 'staff'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

// --- filters (top panel) ---
const route = useRoute()
const q = ref('')
const status = ref<'all' | 'new' | 'confirmed' | 'in_work' | 'shipped' | 'closed'>('all')
const store = ref<'all' | string>('all')
const problematic = ref(false)
const dateFrom = ref<string>('')
const dateTo = ref<string>('')

// --- data ---
const loading = ref(false)
const error = ref<string | null>(null)
const orders = ref<any[]>([])

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
}

async function acceptOne(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/accept`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { warehouse: 'MAIN' },
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

async function toProduction(id: number) {
  if (!auth.accessToken) return
  await $fetch(`/api/ops/orders/${id}/production`, {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    body: { warehouse: 'MAIN' },
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

watch([q, status, store, problematic, dateFrom, dateTo], () => {
  // небольшая защита от "стрельбы" на каждый ввод — но без сторонних либ
  load()
})

watch(
  () => route.query,
  (qry) => {
    const s = String(qry?.status || '').trim()
    const qq = String(qry?.q || '').trim()
    if (s && ['new', 'confirmed', 'in_work', 'shipped', 'closed', 'all'].includes(s)) status.value = s as any
    if (typeof qry?.q !== 'undefined') q.value = qq
  },
  { immediate: true },
)

onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Заказы</h1>
        <p class="text-sm text-gray-600 mt-1">Обработка заказов как в OMS: статусы склада/производства/отгрузки + массовые действия</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="exportCsv">
          Экспорт
        </button>
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">
          Обновить
        </button>
      </div>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <!-- top panel -->
    <div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 flex-1">
          <input
            v-model="q"
            placeholder="Поиск: номер / телефон / артикул / email"
            class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          />

          <select v-model="status" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="confirmed">Подтверждённые</option>
            <option value="in_work">В работе</option>
            <option value="shipped">Отгруженные</option>
            <option value="closed">Закрытые</option>
          </select>

          <select v-model="store" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option value="all">Все магазины</option>
            <option value="Сайт">Сайт</option>
          </select>

          <label class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <input v-model="problematic" type="checkbox" class="rounded" />
            <span>Проблемные</span>
          </label>
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex gap-2">
            <input v-model="dateFrom" type="date" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm" />
            <input v-model="dateTo" type="date" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm" />
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="presetToday">Сегодня</button>
            <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="presetWeek">Неделя</button>
            <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="presetMonth">Месяц</button>
          </div>
        </div>
      </div>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="text-sm text-gray-600">
          Найдено: <span class="font-semibold text-gray-900">{{ orders.length }}</span>
          <span v-if="selectedIds.length" class="ml-2">· Выбрано: <span class="font-semibold text-gray-900">{{ selectedIds.length }}</span></span>
        </div>
        <div class="flex items-center gap-2">
          <select v-model="bulkAction" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option value="">Массовые действия…</option>
            <option value="accept">Принять</option>
            <option value="cancel">Отменить</option>
            <option value="to_production">В производство</option>
            <option value="ship">Пометить отгружено</option>
          </select>
          <button
            class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
            :disabled="!selectedIds.length || !bulkAction"
            @click="runBulk"
          >
            Применить
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

    <!-- table -->
    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="text-left px-4 py-3 w-[48px]">
                <input
                  type="checkbox"
                  class="rounded"
                  :checked="orders.length && selectedIds.length === orders.length"
                  @change="toggleAll(($event.target as HTMLInputElement).checked)"
                />
              </th>
              <th class="text-left px-4 py-3">№ / дата</th>
              <th class="text-left px-4 py-3">Магазин / клиент</th>
              <th class="text-left px-4 py-3">Сумма</th>
              <th class="text-left px-4 py-3">Статус заказа</th>
              <th class="text-left px-4 py-3">Склад</th>
              <th class="text-left px-4 py-3">Производство</th>
              <th class="text-left px-4 py-3">Отгрузка</th>
              <th class="text-left px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id" class="border-t border-gray-100 hover:bg-gray-50/50">
              <td class="px-4 py-3 align-top">
                <input v-model="selected[o.id]" type="checkbox" class="rounded" />
              </td>
              <td class="px-4 py-3 align-top">
                <div class="font-semibold">#{{ o.id }}</div>
                <div class="text-xs text-gray-500">{{ humanDate(o.createdAt) }}</div>
              </td>
              <td class="px-4 py-3 align-top">
                <div class="text-xs text-gray-500">{{ o.store || '—' }}</div>
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
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="acceptOne(detail.order.id)">Принять заказ</button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="toProduction(detail.order.id)">Создать производственное задание</button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="createShipment(detail.order.id)">Создать отгрузку</button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="shipOne(detail.order.id)">Подтвердить отгрузку</button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="cancelOne(detail.order.id)">Отменить</button>
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
