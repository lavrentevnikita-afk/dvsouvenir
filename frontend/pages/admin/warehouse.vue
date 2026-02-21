<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

type Tab = 'items' | 'movements' | 'inventory'
const route = useRoute()

const tab = ref<Tab>((route.query.tab as Tab) || 'items')

// --- Items tab ---
const warehouse = ref<string>(String(route.query.warehouse || 'BLANKS').toUpperCase())
const deficitOnly = ref(false)
const withReservedOnly = ref(false)

const loading = ref(false)
const error = ref<string | null>(null)
const items = ref<any[]>([])

// --- Movements tab ---
const mWarehouse = ref<string>(String(route.query.warehouse || 'BLANKS').toUpperCase())
const dateFrom = ref<string>('')
const dateTo = ref<string>('')
const productId = ref<string>('')
const orderId = ref<string>('')
const workOrderId = ref<string>('')
const movementsLoading = ref(false)
const movementsError = ref<string | null>(null)
const movements = ref<any[]>([])

// --- Inventory tab ---
const invWarehouse = ref<string>(String(route.query.warehouse || 'BLANKS').toUpperCase())
const invSessionId = ref<string>(String(route.query.inventoryId || ''))
const inv = ref<any | null>(null)
const invLines = ref<any[]>([])
const invWarnings = ref<any[]>([])
const invLoading = ref(false)
const invError = ref<string | null>(null)
const invSaveLoading = ref(false)
const invApplyLoading = ref(false)
const invToast = ref<string | null>(null)

function whLabel(code: string) {
  const c = String(code || '').toUpperCase()
  if (c === 'BLANKS') return 'Заготовки'
  if (c === 'FINISHED') return 'Готовая продукция'
  if (c === 'DEFECT') return 'Брак'
  return c
}

async function loadItems() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/warehouse/items', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: { warehouse: warehouse.value },
    })
    items.value = Array.isArray(res?.items) ? res.items : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить склад'
  } finally {
    loading.value = false
  }
}

function typeLabel(t: string) {
  const tt = String(t || '').toLowerCase()
  if (tt === 'in') return 'Приход'
  if (tt === 'out') return 'Расход'
  if (tt === 'reserve') return 'Резерв'
  if (tt === 'unreserve') return 'Снятие резерва'
  if (tt === 'adjust') return 'Корректировка'
  if (tt === 'inventory_adjust') return 'Инвентаризация'
  return t
}

function typeBadgeClass(t: string) {
  const tt = String(t || '').toLowerCase()
  if (tt === 'in') return 'bg-green-50 border-green-200 text-green-800'
  if (tt === 'out') return 'bg-red-50 border-red-200 text-red-800'
  if (tt === 'reserve') return 'bg-blue-50 border-blue-200 text-blue-800'
  if (tt === 'unreserve') return 'bg-gray-50 border-gray-200 text-gray-800'
  if (tt === 'adjust') return 'bg-yellow-50 border-yellow-200 text-yellow-800'
  if (tt === 'inventory_adjust') return 'bg-purple-50 border-purple-200 text-purple-800'
  return 'bg-gray-50 border-gray-200 text-gray-800'
}

async function loadInventory(id: string) {
  if (!auth.accessToken) return
  if (!id) return
  invLoading.value = true
  invError.value = null
  invToast.value = null
  try {
    const res = await $fetch<any>(`/api/admin/inventory/${id}`, {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    inv.value = res?.session || null
    invLines.value = Array.isArray(res?.lines) ? res.lines : []
    invWarnings.value = Array.isArray(res?.warnings) ? res.warnings : []
  } catch (e: any) {
    invError.value = e?.data?.message || 'Не удалось загрузить инвентаризацию'
  } finally {
    invLoading.value = false
  }
}

async function createInventory() {
  if (!auth.accessToken) return
  invLoading.value = true
  invError.value = null
  invToast.value = null
  try {
    const res = await $fetch<any>('/api/admin/inventory', {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { warehouse: invWarehouse.value },
    })
    const sid = String(res?.session?.id || '')
    if (!sid) throw new Error('no session id')
    invSessionId.value = sid
    inv.value = res?.session || null
    invLines.value = Array.isArray(res?.lines) ? res.lines : []
    invWarnings.value = Array.isArray(res?.warnings) ? res.warnings : []
    navigateTo({ path: '/admin/warehouse', query: { ...route.query, tab: 'inventory', warehouse: invWarehouse.value, inventoryId: sid } })
  } catch (e: any) {
    invError.value = e?.data?.message || 'Не удалось создать инвентаризацию'
  } finally {
    invLoading.value = false
  }
}

async function saveInventoryFacts() {
  if (!auth.accessToken) return
  if (!invSessionId.value) return
  invSaveLoading.value = true
  invError.value = null
  invToast.value = null
  try {
    const payloadLines = invLines.value.map((l: any) => ({
      productId: l.productId,
      factQty: l.factQty === '' || l.factQty == null ? null : Number(l.factQty),
    }))
    const res = await $fetch<any>(`/api/admin/inventory/${invSessionId.value}/lines`, {
      baseURL: apiBaseUrl,
      method: 'PUT',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { lines: payloadLines },
    })
    inv.value = res?.session || null
    invLines.value = Array.isArray(res?.lines) ? res.lines : []
    invWarnings.value = Array.isArray(res?.warnings) ? res.warnings : []
    invToast.value = 'Сохранено'
  } catch (e: any) {
    invError.value = e?.data?.message || 'Не удалось сохранить факт'
  } finally {
    invSaveLoading.value = false
  }
}

async function applyInventory() {
  if (!auth.accessToken) return
  if (!invSessionId.value) return
  invApplyLoading.value = true
  invError.value = null
  invToast.value = null
  try {
    const res = await $fetch<any>(`/api/admin/inventory/${invSessionId.value}/apply`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    invToast.value = res?.warnings?.length ? `Применено (есть предупреждения: ${res.warnings.length})` : 'Применено'
    await loadInventory(invSessionId.value)
    // обновим товары, чтобы сразу видеть новый остаток
    await loadItems()
  } catch (e: any) {
    invError.value = e?.data?.message || 'Не удалось применить инвентаризацию'
  } finally {
    invApplyLoading.value = false
  }
}

async function loadMovements() {
  if (!auth.accessToken) return
  movementsLoading.value = true
  movementsError.value = null
  try {
    const res = await $fetch<any>('/api/admin/warehouse/movements', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: {
        warehouse: mWarehouse.value,
        ...(productId.value ? { productId: productId.value } : {}),
        ...(orderId.value ? { orderId: orderId.value } : {}),
        ...(workOrderId.value ? { workOrderId: workOrderId.value } : {}),
        ...(dateFrom.value ? { dateFrom: dateFrom.value } : {}),
        ...(dateTo.value ? { dateTo: dateTo.value } : {}),
      },
    })
    movements.value = Array.isArray(res?.movements) ? res.movements : []
  } catch (e: any) {
    movementsError.value = e?.data?.message || 'Не удалось загрузить движения'
  } finally {
    movementsLoading.value = false
  }
}

const displayedItems = computed(() => {
  const arr = items.value
  return arr.filter((it: any) => {
    const free = Number(it?.free || 0)
    const reserved = Number(it?.reserved || 0)
    if (deficitOnly.value) {
      // For blanks we prefer purchaseNeeded hint, otherwise free==0.
      if (warehouse.value === 'BLANKS') {
        if (!it?.purchaseNeeded && free > 0) return false
      } else {
        if (free > 0) return false
      }
    }
    if (withReservedOnly.value && reserved <= 0) return false
    return true
  })
})

watch([warehouse, tab], async () => {
  if (tab.value === 'items') await loadItems()
})

watch([mWarehouse, tab], async () => {
  if (tab.value === 'movements') await loadMovements()
})

onMounted(async () => {
  // normalize
  if (!['BLANKS', 'FINISHED', 'DEFECT'].includes(warehouse.value)) warehouse.value = 'BLANKS'
  if (!['BLANKS', 'FINISHED', 'DEFECT'].includes(mWarehouse.value)) mWarehouse.value = 'BLANKS'
  if (!['BLANKS', 'FINISHED', 'DEFECT'].includes(invWarehouse.value)) invWarehouse.value = 'BLANKS'
  if (!['items', 'movements', 'inventory'].includes(tab.value)) tab.value = 'items'
  if (tab.value === 'items') await loadItems()
  if (tab.value === 'movements') await loadMovements()
  if (tab.value === 'inventory' && invSessionId.value) await loadInventory(invSessionId.value)
})

function setTab(t: Tab) {
  tab.value = t
  const wh = t === 'movements' ? mWarehouse.value : warehouse.value
  navigateTo({ path: '/admin/warehouse', query: { ...route.query, tab: t, warehouse: wh } })
}

function onWarehouseChanged() {
  mWarehouse.value = warehouse.value
  invWarehouse.value = warehouse.value
  navigateTo({ path: '/admin/warehouse', query: { ...route.query, tab: tab.value, warehouse: warehouse.value } })
}

function onMovementsWarehouseChanged() {
  warehouse.value = mWarehouse.value
  invWarehouse.value = mWarehouse.value
  navigateTo({ path: '/admin/warehouse', query: { ...route.query, tab: tab.value, warehouse: mWarehouse.value } })
}

function onInvWarehouseChanged() {
  warehouse.value = invWarehouse.value
  mWarehouse.value = invWarehouse.value
  navigateTo({ path: '/admin/warehouse', query: { ...route.query, tab: tab.value, warehouse: invWarehouse.value } })
}
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <AdminPageHeader 
      title="Склад" 
      description="Остатки, движения и инвентаризация" 
      icon="📦"
    />

    <!-- Tabs -->
    <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 w-fit">
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="tab === 'items' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        @click="setTab('items')"
      >
        Товары
      </button>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="tab === 'movements' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        @click="setTab('movements')"
      >
        Движения
      </button>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="tab === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
        @click="setTab('inventory')"
      >
        Инвентаризация
      </button>
    </div>

    <!-- Items Tab -->
    <template v-if="tab === 'items'">
      <AdminCard>
        <div class="flex flex-wrap items-end gap-4">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Склад</label>
            <AdminSelect 
              v-model="warehouse" 
              @change="onWarehouseChanged"
              :options="[
                { value: 'BLANKS', label: 'Заготовки' },
                { value: 'FINISHED', label: 'Готовая продукция' },
                { value: 'DEFECT', label: 'Брак' },
              ]"
            />
          </div>

          <label class="flex items-center gap-2 text-sm select-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <input v-model="deficitOnly" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
            <span class="text-slate-700">Дефицит</span>
          </label>
          <label class="flex items-center gap-2 text-sm select-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
            <input v-model="withReservedOnly" type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
            <span class="text-slate-700">С резервом</span>
          </label>

          <AdminButton @click="loadItems" :loading="loading" class="ml-auto">
            Обновить
          </AdminButton>
        </div>
      </AdminCard>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
        <span>❌</span>
        {{ error }}
      </div>

      <AdminCard :padding="false">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
              <tr>
                <th class="text-left px-5 py-3.5 font-semibold">Товар</th>
                <th class="text-left px-5 py-3.5 font-semibold">SKU</th>
                <th class="text-left px-5 py-3.5 font-semibold">Тип</th>
                <th class="text-right px-5 py-3.5 font-semibold">Кол-во</th>
                <th class="text-right px-5 py-3.5 font-semibold">Резерв</th>
                <th class="text-right px-5 py-3.5 font-semibold">Свободно</th>
                <th v-if="warehouse === 'BLANKS'" class="text-left px-5 py-3.5 font-semibold">Закупка</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td class="px-5 py-12 text-center text-slate-500" :colspan="warehouse === 'BLANKS' ? 7 : 6">
                  <div class="flex items-center justify-center gap-3">
                    <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Загрузка…</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="displayedItems.length === 0">
                <td class="px-5 py-12 text-center text-slate-500" :colspan="warehouse === 'BLANKS' ? 7 : 6">
                  <div class="text-4xl mb-2">📦</div>
                  <div>Товары не найдены</div>
                </td>
              </tr>
              <tr v-for="it in displayedItems" :key="it.product.id" class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-4">
                  <div class="font-semibold text-slate-900">{{ it.product.name }}</div>
                  <div class="text-xs text-slate-500">ID: {{ it.product.id }} · {{ whLabel(warehouse) }}</div>
                </td>
                <td class="px-5 py-4 text-slate-600">{{ it.product.sku }}</td>
                <td class="px-5 py-4 text-slate-600">{{ it.product.kind }}</td>
                <td class="px-5 py-4 text-right font-medium text-slate-900">{{ it.qty }}</td>
                <td class="px-5 py-4 text-right text-amber-600 font-medium">{{ it.reserved }}</td>
                <td class="px-5 py-4 text-right font-bold text-slate-900">{{ it.free }}</td>
                <td v-if="warehouse === 'BLANKS'" class="px-5 py-4">
                  <AdminStatusBadge 
                    :status="it.purchaseNeeded ? 'deficit' : 'ok'" 
                    :map="{ 
                      deficit: { label: 'Нужно', color: 'amber' }, 
                      ok: { label: 'Ок', color: 'green' } 
                    }"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AdminCard>
    </template>

    <!-- Movements Tab -->
    <template v-else-if="tab === 'movements'">
      <AdminCard>
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Склад</label>
            <AdminSelect 
              v-model="mWarehouse" 
              @change="onMovementsWarehouseChanged"
              :options="[
                { value: 'BLANKS', label: 'Заготовки' },
                { value: 'FINISHED', label: 'Готовая продукция' },
                { value: 'DEFECT', label: 'Брак' },
              ]"
            />
          </div>

          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Дата с</label>
            <AdminInput v-model="dateFrom" type="date" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Дата по</label>
            <AdminInput v-model="dateTo" type="date" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Product ID</label>
            <AdminInput v-model="productId" placeholder="например 12" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Заказ</label>
            <AdminInput v-model="orderId" placeholder="#" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">WO</label>
            <AdminInput v-model="workOrderId" placeholder="#" />
          </div>

          <AdminButton @click="loadMovements" :loading="movementsLoading" class="ml-auto">
            Обновить
          </AdminButton>
        </div>
      </AdminCard>

      <div v-if="movementsError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
        <span>❌</span>
        {{ movementsError }}
      </div>

      <AdminCard :padding="false">
        <div v-if="movementsLoading" class="px-5 py-12 text-center text-slate-500">
          <div class="flex items-center justify-center gap-3">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>Загрузка…</span>
          </div>
        </div>
        <div v-else-if="movements.length === 0" class="px-5 py-12 text-center text-slate-500">
          <div class="text-4xl mb-2">🔄</div>
          <div>Движения не найдены</div>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <div v-for="m in movements" :key="m.id" class="px-5 py-4 hover:bg-slate-50/70 transition-colors">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium" :class="typeBadgeClass(m.type)">
                    {{ typeLabel(m.type) }}
                  </span>
                  <span class="font-bold text-slate-900">{{ m.qty }}</span>
                  <span class="text-slate-400">·</span>
                  <span class="font-medium text-slate-700 truncate">{{ m.product?.name || ('product#' + m.productId) }}</span>
                  <span v-if="m.product?.article" class="text-xs text-slate-500">SKU: {{ m.product.article }}</span>
                </div>

                <div class="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span>{{ new Date(m.createdAt).toLocaleString() }}</span>
                  <span class="text-slate-300">·</span>
                  <span>{{ whLabel(m.warehouse) }}</span>
                  <template v-if="m.orderId">
                    <span class="text-slate-300">·</span>
                    <NuxtLink class="text-slate-700 hover:underline" :to="{ path: '/admin/orders', query: { q: String(m.orderId) } }">
                      Заказ #{{ m.orderId }}
                    </NuxtLink>
                  </template>
                  <template v-if="m.workOrderId">
                    <span class="text-slate-300">·</span>
                    <NuxtLink class="text-slate-700 hover:underline" :to="{ path: '/admin/production', query: { q: String(m.workOrderId) } }">
                      WO #{{ m.workOrderId }}
                    </NuxtLink>
                  </template>
                  <template v-if="m.user">
                    <span class="text-slate-300">·</span>
                    <span>by {{ m.user?.name || m.user?.email }}</span>
                  </template>
                  <template v-if="m.note">
                    <span class="text-slate-300">·</span>
                    <span class="truncate">{{ m.note }}</span>
                  </template>
                </div>
              </div>

              <div class="text-xs text-slate-400 whitespace-nowrap">#{{ m.id }}</div>
            </div>
          </div>
        </div>
      </AdminCard>
    </template>

    <!-- Inventory Tab -->
    <template v-else>
      <AdminCard>
        <div class="flex flex-wrap items-end gap-4">
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Склад</label>
            <AdminSelect 
              v-model="invWarehouse" 
              @change="onInvWarehouseChanged"
              :options="[
                { value: 'BLANKS', label: 'Заготовки' },
                { value: 'FINISHED', label: 'Готовая продукция' },
                { value: 'DEFECT', label: 'Брак' },
              ]"
            />
          </div>

          <AdminButton variant="primary" @click="createInventory" :loading="invLoading">
            Создать инвентаризацию
          </AdminButton>

          <AdminButton v-if="invSessionId" @click="loadInventory(invSessionId)" :loading="invLoading">
            Обновить
          </AdminButton>

          <div v-if="inv" class="ml-auto flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
            <span>Сессия #{{ inv.id }}</span>
            <AdminStatusBadge :status="inv.status" :map="{ draft: { label: 'Черновик', color: 'amber' }, applied: { label: 'Применено', color: 'green' } }" />
            <span>{{ whLabel(inv.warehouse?.code) }}</span>
          </div>
        </div>
      </AdminCard>

      <div v-if="invToast" class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
        <span>✅</span>
        {{ invToast }}
      </div>
      <div v-if="invError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
        <span>❌</span>
        {{ invError }}
      </div>

      <div v-if="invWarnings.length" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
        <span>⚠️</span>
        Есть позиции, где <b>Факт &lt; Резерв</b>: {{ invWarnings.length }}
      </div>

      <AdminCard :padding="false">
        <div v-if="invLoading" class="px-5 py-12 text-center text-slate-500">
          <div class="flex items-center justify-center gap-3">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>Загрузка…</span>
          </div>
        </div>
        <div v-else-if="!invSessionId" class="px-5 py-12 text-center text-slate-500">
          <div class="text-4xl mb-2">📊</div>
          <div>Создай сессию инвентаризации — система сделает snapshot остатков</div>
        </div>
        <div v-else>
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
              <tr>
                <th class="text-left px-5 py-3.5 font-semibold">Товар</th>
                <th class="text-right px-5 py-3.5 font-semibold">Система</th>
                <th class="text-right px-5 py-3.5 font-semibold">Резерв</th>
                <th class="text-right px-5 py-3.5 font-semibold">Факт</th>
                <th class="text-right px-5 py-3.5 font-semibold">Δ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="invLines.length === 0">
                <td class="px-5 py-12 text-center text-slate-500" colspan="5">
                  <div class="text-4xl mb-2">📊</div>
                  <div>Нет позиций</div>
                </td>
              </tr>
              <tr
                v-for="l in invLines"
                :key="l.id"
                class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                :class="l.warningFactLessThanReserved ? 'bg-amber-50/50' : ''"
              >
                <td class="px-5 py-4">
                  <div class="font-semibold text-slate-900">{{ l.product?.name || ('product#' + l.productId) }}</div>
                  <div class="text-xs text-slate-500">ID: {{ l.productId }} · SKU: {{ l.product?.sku }}</div>
                </td>
                <td class="px-5 py-4 text-right font-medium text-slate-700">{{ l.systemQty }}</td>
                <td class="px-5 py-4 text-right text-amber-600 font-medium">{{ l.reserved }}</td>
                <td class="px-5 py-4 text-right">
                  <input
                    v-model.number="l.factQty"
                    type="number"
                    min="0"
                    class="border border-slate-200 rounded-lg px-3 py-2 w-24 text-right shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"
                    :disabled="inv?.status !== 'draft'"
                  />
                </td>
                <td class="px-5 py-4 text-right font-bold" :class="Number(l.delta) < 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ l.factQty == null ? '—' : l.delta }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AdminCard>

      <div v-if="invSessionId" class="flex items-center gap-3">
        <AdminButton @click="saveInventoryFacts" :loading="invSaveLoading" :disabled="inv?.status !== 'draft'">
          💾 Сохранить факт
        </AdminButton>

        <AdminButton 
          variant="primary"
          @click="applyInventory" 
          :loading="invApplyLoading" 
          :disabled="inv?.status !== 'draft'"
        >
          ✅ Применить расхождения
        </AdminButton>

        <div class="text-xs text-slate-500">
          Мастер: создать → сверить факт → применить. Движения пишутся как <b>inventory_adjust</b>.
        </div>
      </div>
    </template>
  </section>
</template>
