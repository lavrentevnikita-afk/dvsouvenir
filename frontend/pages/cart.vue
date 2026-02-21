import { ref, computed, watch, onMounted } from 'vue'
import { useCityStore } from '~/stores/city'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
<script setup lang="ts">
import { mapErrorToUi, normalizeApiError } from '~/utils/app-error'
import { useCityStore } from '~/stores/city'
const cartStore = useCartStore()
const router = useRouter()
const auth = useAuthStore()
const config = useRuntimeConfig()
auth.initFromStorage()
const cityStore = useCityStore()
onMounted(() => cityStore.init())

type PreviewItem = {
  product: { id: number; name: string; article?: string; imageUrl?: string | null }
  quantity: number
  availability: { status: 'in_stock' | 'made_to_order' | 'awaiting'; canOrder: boolean }
  price: {
    retailUnit: number
    discountPercent: number
    discountUnit: number
    finalUnit: number
    retailLine: number
    discountLine: number
    finalLine: number
  }
}

const isLoading = ref(false)
const preview = ref<{ items: PreviewItem[]; totals: { retail: number; discount: number; final: number }; canCheckout: boolean } | null>(null)
const previewError = ref<{ title: string; text: string; actionLabel?: string; action?: string } | null>(null)

async function loadPreview() {
  if (cartStore.isEmpty) {
    preview.value = { items: [], totals: { retail: 0, discount: 0, final: 0 }, canCheckout: false }
    return
  }
  isLoading.value = true
  previewError.value = null
  try {
    const res = await $fetch<any>('/api/cart/preview', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      body: {
        items: cartStore.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        city: cityStore.code || undefined
      },
      headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : undefined,
    })
    preview.value = res
  } catch (e: any) {
    previewError.value = mapErrorToUi(normalizeApiError(e))
  } finally {
    isLoading.value = false
  }
}

watch(
  () => [cartStore.items.map((i) => [i.product.id, i.quantity]), auth.accessToken, cityStore.code],
  () => {
    loadPreview()
  },
  { deep: true, immediate: true },
)

const items = computed(() => cartStore.items)
const totalPrice = computed(() => preview.value?.totals?.final ?? cartStore.totalPrice)

const WHOLESALE_COEF = 0.85
const wholesaleTotal = computed(() =>
  cartStore.items.reduce((acc, item) => {
    const wp = item.product.wholesalePrice == null
      ? Number(item.product.price) * WHOLESALE_COEF
      : Number(item.product.wholesalePrice)
    return acc + wp * item.quantity
  }, 0)
)

const b2bSavings = computed(() => {
  const retail = Number(totalPrice.value)
  const wholesale = Number(wholesaleTotal.value)
  const diff = retail - wholesale
  return diff > 0 ? diff : 0
})
const isEmpty = computed(() => cartStore.isEmpty)
const productIds = computed(() => items.value.map((i) => i.product.id))

function onQuantityChange(itemId: number, value: string) {
  const num = Number(value)
  if (Number.isNaN(num)) return
  cartStore.setQuantity(itemId, num)
}

function removeItem(id: number) {
  cartStore.removeItem(id)
}

function goToCheckout() {
  if (cartStore.isEmpty) return
  if (preview.value && !preview.value.canCheckout) return
  router.push('/checkout')
}

function statusLabel(s: PreviewItem['availability']['status']) {
  if (s === 'in_stock') return 'В наличии'
  if (s === 'made_to_order') return 'Под заказ'
  return 'Ожидаем'
}

const previewById = computed(() => {
  const m = new Map<number, PreviewItem>()
  for (const it of preview.value?.items ?? []) m.set(it.product.id, it)
  return m
})

function pItem(id: number) {
  return previewById.value.get(id)
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">Корзина</h1>
      <p class="text-sm text-gray-600">
        Проверьте товары перед оформлением заказа.
      </p>
    </header>

    <div v-if="isEmpty" class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
      Ваша корзина пуста. Откройте каталог и добавьте первые товары.
      <div class="mt-3">
        <NuxtLink
          to="/catalog"
          class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
        >
          В каталог
        </NuxtLink>
      </div>
    </div>

    <div v-else class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
      <!-- Список товаров -->
      <div class="space-y-6">
        <div v-if="previewError" class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <div class="font-medium">{{ previewError.title }}</div>
          <div class="mt-1">{{ previewError.text }}</div>
          <button
            v-if="previewError.action === 'refresh_cart'"
            type="button"
            class="mt-2 inline-flex items-center rounded-full bg-red-700 px-3 py-1 text-[11px] font-medium text-white"
            @click="loadPreview()"
          >
            Обновить корзину
          </button>
        </div>

        <ul class="space-y-3">
        <li
          v-for="item in items"
          :key="item.product.id"
          class="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm"
        >
          <div
            class="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50 flex items-center justify-center"
          >
            <img
              v-if="item.product.imageUrl"
              :src="item.product.imageUrl"
              :alt="item.product.name"
              class="h-full w-full object-cover"
            />
            <span v-else class="text-[10px] text-gray-400">
              Нет фото
            </span>
          </div>

          <div class="flex flex-1 flex-col gap-1">
            <div class="flex justify-between gap-3">
              <NuxtLink
                :to="`/product/${item.product.id}`"
                class="font-medium text-gray-900 hover:text-brand line-clamp-2"
              >
                {{ item.product.name }}
              </NuxtLink>
              <button
                type="button"
                class="text-[11px] text-gray-400 hover:text-red-500"
                @click="removeItem(item.product.id)"
              >
                Удалить
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <p class="text-xs text-gray-500" v-if="item.product.article">
                Артикул: {{ item.product.article }}
              </p>
              <span
                class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]"
                :class="(preview?.items?.find(p => p.product.id === item.product.id)?.availability?.canOrder ?? true)
                  ? 'border-gray-200 text-gray-600'
                  : 'border-red-200 text-red-700 bg-red-50'"
              >
                {{ statusLabel(preview?.items?.find(p => p.product.id === item.product.id)?.availability?.status ?? 'awaiting') }}
              </span>
            </div>

            <div class="mt-1 flex items-center justify-between gap-3">
              <div class="inline-flex items-center rounded-full border border-gray-200 px-2 py-1 text-[11px]">
                <span class="mr-2 text-gray-500">
                  Количество
                </span>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  class="w-16 border-none bg-transparent text-xs outline-none"
                  @input="onQuantityChange(item.product.id, ($event.target as HTMLInputElement).value)"
                />
              </div>

              <div class="text-right">
                <p class="text-xs text-gray-500">Цена</p>
                <p class="text-sm font-semibold">
                  {{ Math.round((preview?.items?.find(p => p.product.id === item.product.id)?.price?.finalLine ?? (item.product.price * item.quantity))) }} ₽
                </p>
                <p
                  v-if="(preview?.items?.find(p => p.product.id === item.product.id)?.price?.discountPercent ?? 0) > 0"
                  class="text-[11px] text-gray-500"
                >
                  Скидка {{ preview?.items?.find(p => p.product.id === item.product.id)?.price?.discountPercent }}%
                </p>
              </div>
            </div>

            <p
              v-if="!(preview?.items?.find(p => p.product.id === item.product.id)?.availability?.canOrder ?? true)"
              class="mt-2 text-[11px] text-red-600"
            >
              Сейчас нельзя заказать в выбранном количестве.
            </p>
          </div>
        </li>
        </ul>

        <CartCrossSell :product-ids="productIds" />
      </div>

      <!-- Итоги -->
      <CartSummary :items-count="cartStore.totalItems" :subtotal="totalPrice">
        <div
          v-if="preview && preview.totals.discount > 0"
          class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900"
        >
          Скидка по магазину: −{{ Math.round(preview.totals.discount) }} ₽
        </div>

        <div
          v-if="preview && !preview.canCheckout"
          class="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
        >
          В корзине есть товары со статусом «Ожидаем» или недостаточным количеством — оформление недоступно.
        </div>
        <!-- B2B баннер полностью удалён -->

        <button
          type="button"
          class="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isEmpty || (preview ? !preview.canCheckout : false) || isLoading"
          @click="goToCheckout"
        >
          Перейти к оформлению
        </button>
      </CartSummary>
    </div>
  </section>
</template>
