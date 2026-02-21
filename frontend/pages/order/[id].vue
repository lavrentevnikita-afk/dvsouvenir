<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const authStore = useAuthStore()

const id = computed(() => Number(route.params.id))

const apiBaseUrl = process.server
  ? config.apiBaseUrl
  : config.public.apiBaseUrl

const { data, pending, error } = await useAsyncData(
  'order', // <-- простой строковый ключ
  () =>
    $fetch(`/api/orders/${id.value}`, {
      baseURL: apiBaseUrl,
      headers: authStore.accessToken
        ? { Authorization: `Bearer ${authStore.accessToken}` }
        : undefined,
    }),
  { watch: [id] }
)

const order = computed(() => data.value?.order ?? null)

const { data: receiptData } = await useAsyncData(
  'order_receipt',
  () =>
    $fetch(`/api/orders/${id.value}/receipt`, {
      baseURL: apiBaseUrl,
      headers: authStore.accessToken
        ? { Authorization: `Bearer ${authStore.accessToken}` }
        : undefined,
    }),
  { watch: [id] }
)

const receipt = computed(() => receiptData.value?.receipt ?? null)

const isB2B = computed(() => authStore.user?.role === 'store')

const fmtMoney = (n: any) => {
  const v = Number(n)
  if (!Number.isFinite(v)) return '0 ₽'
  return `${Math.round(v).toLocaleString('ru-RU')} ₽`
}

const downloadInvoice = async () => {
  if (!authStore.accessToken) return
  const res = await $fetch.raw(`/api/orders/${id.value}/invoice`, {
    baseURL: apiBaseUrl,
    headers: { Authorization: `Bearer ${authStore.accessToken}` },
    responseType: 'blob',
  })
  const blob = res._data as Blob
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-order-${id.value}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
 }

const downloadWaybill = async () => {
  if (!authStore.accessToken) return
  const res = await $fetch.raw(`/api/orders/${id.value}/waybill-pdf`, {
    baseURL: apiBaseUrl,
    headers: { Authorization: `Bearer ${authStore.accessToken}` },
    responseType: 'blob',
  })
  const blob = res._data as Blob
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `waybill-${id.value}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

</script>

<template>
  <section v-if="pending" class="text-sm text-gray-500">
    Загрузка информации о заказе...
  </section>

  <section v-else-if="error || !order" class="space-y-2">
    <h1 class="text-xl font-semibold">Заказ не найден</h1>
    <p class="text-sm text-gray-600">
      Возможно, номер заказа указан неверно или заказ был удалён.
    </p>
    <NuxtLink
      to="/"
      class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
    >
      На главную
    </NuxtLink>
  </section>

  <section v-else class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">
        Заказ №{{ order.id }}
      </h1>
      <p class="text-sm text-gray-600">
        Заказ принят в обработку. Накладная доступна в карточке заказа.
      </p>
    </header>

    <div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
      <div class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <h2 class="text-sm font-semibold">Статус заказа</h2>
        <div v-if="receipt" class="space-y-2">
          <div class="flex flex-wrap gap-2">
            <span
              v-for="s in receipt.statusSteps"
              :key="s.key"
              class="rounded-full px-3 py-1 text-[11px] font-medium"
              :class="s.done ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700'"
            >
              {{ s.label }}
            </span>
          </div>

          <div class="rounded-lg bg-gray-50 p-3">
            <p class="text-xs font-semibold text-gray-900">{{ receipt.nextStep.title }}</p>
            <p class="mt-1 text-xs text-gray-600">{{ receipt.nextStep.text }}</p>
          </div>
        </div>
        <p v-else class="text-xs text-gray-600">
          Текущий статус:
          <span class="font-medium text-gray-900">{{ order.status }}</span>
        </p>
        <p class="text-xs text-gray-600" v-if="order.createdAt">
          Дата создания:
          <span class="font-medium text-gray-900">
            {{ new Date(order.createdAt).toLocaleString() }}
          </span>
        </p>

        <div v-if="isB2B && receipt" class="flex flex-wrap gap-2">
          <button
            type="button"
            @click="downloadInvoice"
            class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
          >
            Скачать счёт
          </button>
          <button
            type="button"
            @click="downloadWaybill"
            class="inline-flex items-center justify-center rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-800"
          >
            Скачать накладную
          </button>
        </div>
      </div>

      <aside class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <h2 class="text-sm font-semibold">Состав заказа</h2>

        <ul class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <li
            v-for="item in (receipt?.items || order.items)"
            :key="item.productId + '-' + item.quantity"
            class="flex justify-between gap-2 text-xs"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-900 line-clamp-2">
                {{ item.name || ('Товар #' + item.productId) }}
              </p>
              <p class="text-[11px] text-gray-500">
                x{{ item.quantity }}
              </p>
            </div>
            <div class="text-right whitespace-nowrap">
              <p class="font-semibold">
                {{ receipt ? fmtMoney(item.finalLine) : (Number((item as any).price) * item.quantity + ' ₽') }}
              </p>
            </div>
          </li>
        </ul>

        <div v-if="receipt" class="flex justify-between text-sm font-semibold">
          <span>Итого по заказу</span>
          <span>{{ fmtMoney(receipt.totals.final) }}</span>
        </div>

        <div v-else class="flex justify-between text-sm font-semibold">
          <span>Итого</span>
          <span>{{ Number(order.totalPrice) }} ₽</span>
        </div>
      </aside>
    </div>

    <NuxtLink
      to="/catalog"
      class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
    >
      Продолжить покупки
    </NuxtLink>
  </section>
</template>
