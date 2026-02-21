<script setup lang="ts">
definePageMeta({
  layout: 'production',
  middleware: ['production'],
})

import { useAuthStore } from '~/stores/auth'

type QueueItem = {
  productId: number
  name: string
  quantity: number
  assets: string[]
}

type QueueOrder = {
  orderId: number
  status: string
  priority: number | null
  deadline: string | null
  items: QueueItem[]
  assets: string[]
  comments: string | null
}

const auth = useAuthStore()
auth.initFromStorage()

const loading = ref(true)
const errorMessage = ref('')
const orders = ref<QueueOrder[]>([])

const filterCity = ref('')
const filterPriority = ref('')
const filterDate = ref('')
const sortBy = ref<'deadline' | 'priority'>('deadline')

const sortedOrders = computed(() => {
  const list = [...(orders.value || [])]
  if (sortBy.value === 'priority') {
    return list.sort((a, b) => {
      const ap = a.priority ?? 999
      const bp = b.priority ?? 999
      if (ap !== bp) return ap - bp
      const ad = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER
      const bd = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER
      return ad - bd
    })
  }
  return list.sort((a, b) => {
    const ad = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER
    const bd = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER
    if (ad !== bd) return ad - bd
    const ap = a.priority ?? 999
    const bp = b.priority ?? 999
    return ap - bp
  })
})

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await $fetch<{ orders: QueueOrder[] }>('/api/production/queue', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: {
        city: filterCity.value || undefined,
        priority: filterPriority.value || undefined,
        date: filterDate.value || undefined,
      },
    })
    orders.value = data.orders || []
  } catch (e: any) {
    console.error(e)
    errorMessage.value = e?.data?.message || 'Не удалось загрузить очередь'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  filterCity.value = ''
  filterPriority.value = ''
  filterDate.value = ''
  load()
}

onMounted(load)
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Очередь производства</h1>
        <p class="text-sm text-gray-500">Список задач на сборку/изготовление. Цены скрыты.</p>
      </div>
      <button
        class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        :disabled="loading"
        @click="load"
      >
        🔄 Обновить
      </button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

    <div class="rounded-2xl border border-gray-200 bg-white p-4">
      <div class="grid gap-3 md:grid-cols-4">
        <label class="text-xs text-gray-500">
          Город
          <input v-model="filterCity" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Напр. Владивосток" />
        </label>
        <label class="text-xs text-gray-500">
          Приоритет
          <select v-model="filterPriority" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
            <option value="">Любой</option>
            <option v-for="p in [1,2,3,4,5]" :key="p" :value="String(p)">{{ p }}</option>
          </select>
        </label>
        <label class="text-xs text-gray-500">
          Дата дедлайна
          <input v-model="filterDate" type="date" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
        </label>
        <label class="text-xs text-gray-500">
          Сортировка
          <select v-model="sortBy" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
            <option value="deadline">По дедлайну</option>
            <option value="priority">По приоритету</option>
          </select>
        </label>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm" :disabled="loading" @click="load">Применить</button>
        <button
          class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
          :disabled="loading"
          @click="resetFilters"
        >
          Сбросить
        </button>
      </div>
    </div>

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
      Загружаю очередь…
    </div>

    <div v-else class="grid gap-3">
      <div
        v-if="orders.length === 0"
        class="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500"
      >
        Сейчас нет заказов “в работе”.
      </div>

      <NuxtLink
        v-for="o in sortedOrders"
        :key="o.orderId"
        :to="`/production/orders/${o.orderId}`"
        class="rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div class="text-sm font-semibold">Заказ #{{ o.orderId }}</div>
              <span class="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                {{ o.status }}
              </span>
              <span v-if="o.priority" class="text-[11px] px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700">
                P{{ o.priority }}
              </span>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Позиции: {{ o.items?.length || 0 }}
              <span v-if="o.deadline"> • Дедлайн: {{ new Date(o.deadline).toLocaleDateString() }}</span>
            </div>
            <div v-if="o.comments" class="text-xs text-gray-600 mt-2 line-clamp-2">
              💬 {{ o.comments }}
            </div>
          </div>
          <div class="text-sm">→</div>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="l in (o.items || []).slice(0, 6)"
            :key="l.productId"
            class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white"
          >
            {{ l.name }} × {{ l.quantity }}
          </span>
          <span
            v-if="(o.items || []).length > 6"
            class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-gray-50"
          >
            +{{ (o.items || []).length - 6 }} ещё
          </span>
        </div>

        <div v-if="(o.assets || []).length" class="mt-3 flex flex-wrap gap-2">
          <img
            v-for="(a, idx) in (o.assets || []).slice(0, 6)"
            :key="a + idx"
            :src="a"
            class="h-10 w-10 rounded-xl border border-gray-200 object-cover bg-white"
            alt="asset"
          />
          <div
            v-if="(o.assets || []).length > 6"
            class="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-500"
          >
            +{{ (o.assets || []).length - 6 }}
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
