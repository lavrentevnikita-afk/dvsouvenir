<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'b2b', middleware: ['b2b', 'staff'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

type Tab = 'items' | 'movements' | 'inventory'
const route = useRoute()

const tab = ref<Tab>((route.query.tab as Tab) || 'items')

const warehouse = ref<string>(String(route.query.warehouse || 'BLANKS').toUpperCase())
const deficitOnly = ref(false)
const withReservedOnly = ref(false)

const loading = ref(false)
const error = ref<string | null>(null)
const items = ref<any[]>([])

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

const displayedItems = computed(() => {
  const arr = items.value
  return arr.filter((it: any) => {
    const free = Number(it?.free || 0)
    const reserved = Number(it?.reserved || 0)
    if (deficitOnly.value) {
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

onMounted(async () => {
  if (!['BLANKS', 'FINISHED', 'DEFECT'].includes(warehouse.value)) warehouse.value = 'BLANKS'
  if (!['items', 'movements', 'inventory'].includes(tab.value)) tab.value = 'items'
  if (tab.value === 'items') await loadItems()
})

function setTab(t: Tab) {
  tab.value = t
  navigateTo({ path: '/b2b/admin/warehouse', query: { ...route.query, tab: t, warehouse: warehouse.value } })
}

function onWarehouseChanged() {
  navigateTo({ path: '/b2b/admin/warehouse', query: { ...route.query, tab: tab.value, warehouse: warehouse.value } })
}
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <h1 class="text-xl font-semibold">Склад</h1>

      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1 rounded border"
          :class="tab === 'items' ? 'bg-black text-white' : 'bg-white'"
          @click="setTab('items')"
        >
          Товары
        </button>
        <button
          class="px-3 py-1 rounded border"
          :class="tab === 'movements' ? 'bg-black text-white' : 'bg-white'"
          @click="setTab('movements')"
        >
          Движения
        </button>
        <button
          class="px-3 py-1 rounded border"
          :class="tab === 'inventory' ? 'bg-black text-white' : 'bg-white'"
          @click="setTab('inventory')"
        >
          Инвентаризация
        </button>
      </div>
    </div>

    <div v-if="tab === 'items'" class="space-y-3">
      <div class="flex flex-wrap items-end gap-4">
        <label class="text-sm">
          <div class="text-gray-500 mb-1">Склад</div>
          <select v-model="warehouse" class="border rounded px-2 py-1" @change="onWarehouseChanged">
            <option value="BLANKS">Заготовки</option>
            <option value="FINISHED">Готовая продукция</option>
            <option value="DEFECT">Брак</option>
          </select>
        </label>

        <label class="flex items-center gap-2 text-sm select-none">
          <input v-model="deficitOnly" type="checkbox" class="border" />
          Дефицит
        </label>
        <label class="flex items-center gap-2 text-sm select-none">
          <input v-model="withReservedOnly" type="checkbox" class="border" />
          С резервом
        </label>

        <button class="ml-auto px-3 py-1 rounded border" @click="loadItems" :disabled="loading">
          Обновить
        </button>
      </div>

      <div v-if="error" class="p-3 border rounded bg-red-50 text-red-700">
        {{ error }}
      </div>

      <div class="border rounded overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left p-2">Товар</th>
              <th class="text-left p-2">SKU</th>
              <th class="text-left p-2">Тип</th>
              <th class="text-right p-2">Кол-во</th>
              <th class="text-right p-2">Резерв</th>
              <th class="text-right p-2">Свободно</th>
              <th v-if="warehouse === 'BLANKS'" class="text-left p-2">Закупка</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="p-3" :colspan="warehouse === 'BLANKS' ? 7 : 6">Загрузка…</td>
            </tr>
            <tr v-else-if="displayedItems.length === 0">
              <td class="p-3" :colspan="warehouse === 'BLANKS' ? 7 : 6">Пусто</td>
            </tr>
            <tr v-for="it in displayedItems" :key="it.product.id" class="border-t">
              <td class="p-2">
                <div class="font-medium">{{ it.product.name }}</div>
                <div class="text-xs text-gray-500">ID: {{ it.product.id }} · {{ whLabel(warehouse) }}</div>
              </td>
              <td class="p-2">{{ it.product.sku }}</td>
              <td class="p-2">{{ it.product.kind }}</td>
              <td class="p-2 text-right">{{ it.qty }}</td>
              <td class="p-2 text-right">{{ it.reserved }}</td>
              <td class="p-2 text-right font-semibold">{{ it.free }}</td>
              <td v-if="warehouse === 'BLANKS'" class="p-2">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded border text-xs"
                  :class="it.purchaseNeeded ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-green-50 border-green-200 text-green-800'"
                >
                  {{ it.purchaseNeeded ? 'Нужно' : 'Ок' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="tab === 'movements'" class="border rounded p-4">
      <div class="text-sm text-gray-600">
        Вкладка «Движения» будет подключена в следующем шаге (API: /api/admin/warehouse/movements).
      </div>
    </div>

    <div v-else class="border rounded p-4">
      <div class="text-sm text-gray-600">
        Вкладка «Инвентаризация» будет подключена в следующем шаге (сессии/строки инвентаризации).
      </div>
    </div>
  </div>
</template>
