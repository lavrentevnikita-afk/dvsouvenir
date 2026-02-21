<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { normalizeApiError, mapErrorToUi } from '~/utils/app-error'

definePageMeta({ layout: 'b2b', middleware: ['staff'] })

const route = useRoute()
const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const shopId = computed(() => Number(route.params.id))

const loading = ref(false)
const saving = ref(false)
const errorUi = ref<{ title: string; text: string; actionText?: string; action?: () => void } | null>(null)

const tab = ref<'overview' | 'orders' | 'audit'>('overview')

const shop = ref<any | null>(null)
const orders = ref<any[]>([])
const audit = ref<any[]>([])

const form = reactive({
  status: 'lead',
  discountPercent: 0,
  notes: '' as string,
})

function setError(e: any) {
  const n = normalizeApiError(e)
  errorUi.value = mapErrorToUi(n)
}

async function loadShop() {
  if (!auth.accessToken) return
  loading.value = true
  errorUi.value = null
  try {
    const res = await $fetch<any>(`/api/admin/shops/${shopId.value}`, {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    shop.value = res?.shop ?? null
    form.status = shop.value?.status ?? 'lead'
    form.discountPercent = Number(shop.value?.discountPercent ?? 0)
    form.notes = String(shop.value?.notes ?? '')
  } catch (e: any) {
    setError(e)
  } finally {
    loading.value = false
  }
}

async function loadOrders() {
  if (!auth.accessToken) return
  try {
    const res = await $fetch<any>(`/api/admin/shops/${shopId.value}/orders`, {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    orders.value = Array.isArray(res?.orders) ? res.orders : []
  } catch (e: any) {
    // non-blocking
    orders.value = []
  }
}

async function loadAudit() {
  if (!auth.accessToken) return
  try {
    const res = await $fetch<any>(`/api/admin/shops/${shopId.value}/audit`, {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    audit.value = Array.isArray(res?.history) ? res.history : []
  } catch {
    audit.value = []
  }
}

async function save() {
  if (!auth.accessToken) return
  saving.value = true
  errorUi.value = null
  try {
    await $fetch(`/api/admin/shops/${shopId.value}`, {
      method: 'PATCH',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: {
        status: form.status,
        discountPercent: Number(form.discountPercent ?? 0),
        notes: form.notes?.trim() ? String(form.notes).slice(0, 5000) : null,
      },
    })
    await loadShop()
    await loadAudit()
  } catch (e: any) {
    setError(e)
  } finally {
    saving.value = false
  }
}

watch(tab, async (t) => {
  if (t === 'orders') await loadOrders()
  if (t === 'audit') await loadAudit()
})

onMounted(async () => {
  await loadShop()
  await loadOrders()
})
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <NuxtLink to="/b2b/admin/stores" class="text-sm text-gray-500 hover:text-gray-900">← К магазинам</NuxtLink>
        <h1 class="text-2xl font-semibold mt-1">
          {{ shop?.displayName || shop?.companyName || `Магазин #${shopId}` }}
        </h1>
        <div class="text-sm text-gray-600 mt-1">
          <span v-if="shop?.city">{{ shop.city }}</span>
          <span v-if="shop?.city && shop?.address"> · </span>
          <span v-if="shop?.address">{{ shop.address }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
          :disabled="loading"
          @click="loadShop"
        >
          Обновить
        </button>
        <button
          class="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90"
          :disabled="saving || loading"
          @click="save"
        >
          {{ saving ? 'Сохранение…' : 'Сохранить' }}
        </button>
      </div>
    </div>

    <div v-if="errorUi" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
      <div class="font-medium text-red-800">{{ errorUi.title }}</div>
      <div class="text-sm text-red-700 mt-1">{{ errorUi.text }}</div>
      <button
        v-if="errorUi.actionText"
        class="mt-3 px-3 py-2 rounded-xl border border-red-200 bg-white text-sm hover:bg-red-100"
        @click="errorUi.action && errorUi.action()"
      >
        {{ errorUi.actionText }}
      </button>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="px-3 py-2 rounded-xl text-sm border"
        :class="tab==='overview' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 hover:bg-gray-100'"
        @click="tab='overview'"
      >
        Карточка
      </button>
      <button
        class="px-3 py-2 rounded-xl text-sm border"
        :class="tab==='orders' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 hover:bg-gray-100'"
        @click="tab='orders'"
      >
        Заказы
      </button>
      <button
        class="px-3 py-2 rounded-xl text-sm border"
        :class="tab==='audit' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 hover:bg-gray-100'"
        @click="tab='audit'"
      >
        История действий
      </button>
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

    <!-- Overview -->
    <div v-else-if="tab==='overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-gray-500">Статус</div>
            <select v-model="form.status" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white">
              <option value="lead">lead</option>
              <option value="active">active</option>
              <option value="blocked">blocked</option>
            </select>
          </div>
          <div>
            <div class="text-xs text-gray-500">Скидка %</div>
            <input
              v-model.number="form.discountPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
            />
          </div>
          <div class="md:col-span-2">
            <div class="text-xs text-gray-500">Заметка (внутренняя)</div>
            <textarea
              v-model="form.notes"
              rows="4"
              class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"
              placeholder="Например: условия, особенности, договорённости…"
            />
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <div class="text-sm font-semibold">Контакты</div>
        <div class="text-sm">
          <div class="text-xs text-gray-500">Контакт</div>
          <div class="mt-1">{{ shop?.user?.name || '—' }}</div>
        </div>
        <div class="text-sm">
          <div class="text-xs text-gray-500">Email</div>
          <div class="mt-1">{{ shop?.user?.email || '—' }}</div>
        </div>
        <div class="text-sm" v-if="shop?.phone">
          <div class="text-xs text-gray-500">Телефон</div>
          <div class="mt-1">{{ shop.phone }}</div>
        </div>
        <div class="text-sm" v-if="shop?.website">
          <div class="text-xs text-gray-500">Сайт</div>
          <div class="mt-1">{{ shop.website }}</div>
        </div>
        <div class="pt-3 border-t border-gray-100">
          <div class="text-xs text-gray-500">Заказов</div>
          <div class="text-lg font-semibold mt-1">{{ shop?.ordersCount ?? 0 }}</div>
          <div class="text-xs text-gray-500 mt-1" v-if="shop?.lastOrderAt">Последний: {{ new Date(shop.lastOrderAt).toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- Orders -->
    <div v-else-if="tab==='orders'" class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="font-semibold">История заказов</div>
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="loadOrders">Обновить</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="text-left px-4 py-3">ID</th>
              <th class="text-left px-4 py-3">Дата</th>
              <th class="text-left px-4 py-3">Статус</th>
              <th class="text-left px-4 py-3">Позиций</th>
              <th class="text-left px-4 py-3">Сумма</th>
              <th class="text-right px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id" class="border-t border-gray-100">
              <td class="px-4 py-3 font-mono text-xs">{{ o.id }}</td>
              <td class="px-4 py-3">{{ o.createdAt ? new Date(o.createdAt).toLocaleString() : '—' }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex px-2 py-1 rounded-lg border text-xs bg-gray-50 border-gray-200">{{ o.status }}</span>
              </td>
              <td class="px-4 py-3">{{ o.itemsCount }}</td>
              <td class="px-4 py-3">{{ o.totalPrice }}</td>
              <td class="px-4 py-3 text-right">
                <NuxtLink :to="`/b2b/admin/orders?q=${encodeURIComponent(String(o.id))}`" class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">
                  Открыть в заказах
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="orders.length===0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500">Пока нет заказов</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Audit -->
    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between">
        <div class="font-semibold">История действий</div>
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="loadAudit">Обновить</button>
      </div>
      <div class="p-4 space-y-2 max-h-[70vh] overflow-auto">
        <div v-for="h in audit" :key="h.id" class="rounded-xl border border-gray-200 p-3">
          <div class="flex items-center justify-between">
            <div class="text-sm font-medium">{{ h.action }}</div>
            <div class="text-xs text-gray-500">{{ new Date(h.createdAt).toLocaleString() }}</div>
          </div>
          <pre v-if="h.meta" class="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 overflow-auto">{{ JSON.stringify(h.meta, null, 2) }}</pre>
        </div>
        <div v-if="audit.length===0" class="text-sm text-gray-500">Пока пусто</div>
      </div>
    </div>
  </section>
</template>
