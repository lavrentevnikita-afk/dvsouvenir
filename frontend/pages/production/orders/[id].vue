<script setup lang="ts">
definePageMeta({
  layout: 'production',
  middleware: ['production'],
})

import { useAuthStore } from '~/stores/auth'

type OrderLine = {
  productId: number
  name: string
  quantity: number
  assets?: string[]
  personalization?: any
  itemNotes?: string | null
  checked?: boolean
  stock?: { qty: number; reservedQty: number; available: number } | null
}

type ProductionOrderHeader = {
  id: number
  status: string
  customerName: string
  address: string
  comment?: string | null
  deadlineAt?: string | null
  priority?: number | null
  packagingRequirements?: any | null
  createdAt: string
}

type ProductionOrderPayload = {
  order: ProductionOrderHeader
  lines: OrderLine[]
}

const route = useRoute()
const id = computed(() => Number(route.params.id))

const auth = useAuthStore()
auth.initFromStorage()

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const okMessage = ref('')
const order = ref<ProductionOrderHeader | null>(null)
const lines = ref<OrderLine[]>([])

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

async function load() {
  loading.value = true
  errorMessage.value = ''
  okMessage.value = ''
  try {
    const data = await $fetch<ProductionOrderPayload>('/api/production/orders/' + id.value, {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    order.value = data.order
    lines.value = Array.isArray((data as any).lines) ? (data as any).lines : []
  } catch (e: any) {
    console.error(e)
    errorMessage.value = e?.data?.message || 'Не удалось загрузить заказ'
  } finally {
    loading.value = false
  }
}

async function toggleChecklist(productId: number, checked: boolean) {
  try {
    await $fetch('/api/production/orders/' + id.value + '/checklist', {
      method: 'POST',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { productId, checked },
    })
  } catch (e) {
    // не блокируем работу — чеклист удобство, а не критичный путь
    console.error(e)
  }
}

async function markReady() {
  if (!order.value) return
  saving.value = true
  errorMessage.value = ''
  okMessage.value = ''
  try {
    await $fetch('/api/production/orders/' + id.value + '/mark-ready', {
      method: 'POST',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    okMessage.value = 'Готово! Заказ отправлен в отгрузки.'
    await load()
  } catch (e: any) {
    console.error(e)
    errorMessage.value = e?.data?.message || 'Не удалось отметить готовность'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <NuxtLink to="/production" class="text-xs text-gray-500 hover:text-gray-700">← Назад в очередь</NuxtLink>
        <h1 class="text-xl font-semibold mt-1">Заказ #{{ id }}</h1>
        <p v-if="order" class="text-sm text-gray-500">
          Статус: <span class="font-medium">{{ order.status }}</span>
        </p>
      </div>

      <button
        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
        :disabled="loading || saving || !order"
        @click="markReady"
      >
        ✅ Готово
      </button>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
    <p v-if="okMessage" class="text-sm text-emerald-700">{{ okMessage }}</p>

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
      Загружаю заказ…
    </div>

    <div v-else-if="order" class="grid gap-3">
      <div class="rounded-2xl border border-gray-200 bg-white p-4">
        <div class="text-sm font-medium">Данные</div>
        <div class="text-sm text-gray-600 mt-2">
          <div><span class="text-gray-500">Клиент:</span> {{ order.customerName }}</div>
          <div class="mt-1"><span class="text-gray-500">Адрес:</span> {{ order.address }}</div>
          <div v-if="order.comment" class="mt-1"><span class="text-gray-500">Комментарий:</span> {{ order.comment }}</div>
          <div v-if="order.deadlineAt" class="mt-1"><span class="text-gray-500">Дедлайн:</span> {{ new Date(order.deadlineAt).toLocaleString() }}</div>
          <div v-if="order.priority !== null && order.priority !== undefined" class="mt-1"><span class="text-gray-500">Приоритет:</span> {{ order.priority }}</div>
          <div v-if="order.packagingRequirements" class="mt-1">
            <span class="text-gray-500">Упаковка:</span>
            <pre class="mt-1 text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-3">{{ JSON.stringify(order.packagingRequirements, null, 2) }}</pre>
          </div>
          <div class="mt-1"><span class="text-gray-500">Создан:</span> {{ new Date(order.createdAt).toLocaleString() }}</div>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-4">
        <div class="text-sm font-medium">Сборка</div>
        <div class="mt-3 grid gap-3">
          <div v-for="l in lines" :key="l.productId" class="rounded-2xl border border-gray-100 p-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    class="h-4 w-4"
                    :checked="Boolean(l.checked)"
                    @change="(e:any) => { l.checked = e.target.checked; toggleChecklist(l.productId, e.target.checked) }"
                  />
                  <div class="font-medium">{{ l.name }}</div>
                </div>
                <div class="text-xs text-gray-500 mt-1">#{{ l.productId }} · Кол-во: <span class="font-medium">{{ l.quantity }}</span></div>
                <div v-if="l.stock" class="text-xs text-gray-600 mt-1">
                  Наличие: доступно {{ l.stock.available }} (всего {{ l.stock.qty }})
                </div>
                <div v-if="l.personalization" class="mt-2">
                  <div class="text-xs text-gray-500">Персонализация</div>
                  <pre class="mt-1 text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-3">{{ JSON.stringify(l.personalization, null, 2) }}</pre>
                </div>
                <div v-if="l.itemNotes" class="mt-2 text-xs text-gray-700">
                  <span class="text-gray-500">Примечание:</span> {{ l.itemNotes }}
                </div>
              </div>
              <div class="shrink-0 text-right">
                <span v-if="l.checked" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">готово</span>
                <span v-else class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-100">в работе</span>
              </div>
            </div>

            <div v-if="l.assets && l.assets.length" class="mt-3">
              <div class="text-xs text-gray-500">Макеты/файлы</div>
              <div class="mt-2 flex flex-wrap gap-2">
                <a
                  v-for="(url, idx) in l.assets.slice(0, 8)"
                  :key="url + idx"
                  :href="url"
                  target="_blank"
                  class="block w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-white"
                  title="Открыть макет"
                >
                  <img :src="url" class="w-full h-full object-cover" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-3 text-xs text-gray-500">Цены скрыты для роли производства. Отметь позиции чеклистом и нажми “Готово”.</p>
      </div>
    </div>
  </section>
</template>
