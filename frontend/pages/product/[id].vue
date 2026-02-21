import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import { useCityStore } from '~/stores/city'
import { useRecentlyViewed } from '~/composables/useRecentlyViewed'
import { useRecentlyViewedCategories } from '~/composables/useRecentlyViewedCategories'
import { useAsyncData, useNuxtData, useRuntimeConfig } from '#app'
import { useToast } from '~/composables/useToast'
<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCityStore } from '@/stores/city'
import { useRecentlyViewed } from '@/composables/useRecentlyViewed'
import { useRecentlyViewedCategories } from '@/composables/useRecentlyViewedCategories'
import { useAsyncData, useNuxtData, useRuntimeConfig } from '#app'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const auth = useAuthStore()
auth.initFromStorage()
const config = useRuntimeConfig()
const apiBaseUrl = process.server
  ? config.apiBaseUrl
  : config.public.apiBaseUrl

const cartStore = useCartStore()
cartStore.initFromStorage()
const { add: addRecentlyViewed } = useRecentlyViewed()
const { add: addRecentCategory } = useRecentlyViewedCategories()

const cityStore = useCityStore()
onMounted(() => cityStore.init())

const id = computed(() => Number(route.params.id))

const { data, pending, error } = await useAsyncData(
  'product',
  () =>
    $fetch(`/api/catalog/products/${id.value}`, {
      baseURL: apiBaseUrl,
      query: cityStore.code ? { city: cityStore.code } : undefined
    }),
  { watch: [id, () => cityStore.code] }
)

const product = computed(() => data.value?.product ?? null)

// Breadcrumbs: full path like other catalog pages (Каталог / Родитель / Подкатегория / Товар)
// IMPORTANT: product payload may not include full parent chain, so we additionally fetch
// category info (with breadcrumbs) from the categories endpoint.
const catSlug = computed(() => String((product.value as any)?.category?.slug || ''))

const { data: catInfo } = await useAsyncData(
  'product_catinfo',
  () =>
    catSlug.value
      ? $fetch<any>(`/api/catalog/categories/${encodeURIComponent(catSlug.value)}`,
          { baseURL: apiBaseUrl }
        )
      : null,
  { watch: [catSlug] }
)

const breadcrumbs = computed(() => {
  const apiCrumbs = Array.isArray((catInfo.value as any)?.breadcrumbs) ? (catInfo.value as any).breadcrumbs : null
  if (apiCrumbs && apiCrumbs.length) return apiCrumbs

  // Fallback: build from product.category parent chain (if present)
  const out: Array<{ slug: string; name: string }> = []
  const seen = new Set<any>()
  let cur: any = (product.value as any)?.category
  let guard = 0
  while (cur && guard < 10) {
    guard += 1
    if (seen.has(cur)) break
    seen.add(cur)
    if (cur.slug && cur.name) out.unshift({ slug: String(cur.slug), name: String(cur.name) })
    cur = cur.parent
  }
  return out
})

// Pricing mode: in B2B area show wholesale first
const priceMode = computed(() =>
  (route.path.startsWith('/b2b') || auth.user?.role === 'store') ? 'b2b' : 'retail'
)

const retailPrice = computed(() => product.value?.retailPrice ?? product.value?.price)
const wholesalePrice = computed(() => {
  if (priceMode.value === 'b2b' && (product.value as any)?.priceInfo?.final != null) return (product.value as any).priceInfo.final
  const direct = product.value?.wholesalePrice ?? null
  return direct
})

const images = computed(() => product.value?.images ?? [])


// Новый блок: вычисляем остатки и статусы
const finishedQty = computed(() => {
  // Остаток готовой продукции (если есть)
  return (product.value as any)?.finishedQty ?? null
})
const isAvailable = computed(() => !!(finishedQty.value && finishedQty.value > 0))
const availabilityStatus = computed(() => {
  const status = (product.value as any)?.availabilityStatus as any
  if (status === 'in_stock') return 'in_stock'
  if (status === 'preorder') return 'preorder'
  if (status === 'expected') return 'expected'
  return null
})
const canOrder = computed(() => {
  const v = (product.value as any)?.canOrder
  if (typeof v === 'boolean') return v
  // fallback for old API
  return isAvailable.value
})

// Для отображения текста статуса
const availabilityText = computed(() => {
  if (availabilityStatus.value === 'in_stock') {
    return finishedQty.value > 0 ? `В наличии: ${finishedQty.value} шт.` : 'В наличии';
  }
  if (availabilityStatus.value === 'preorder') {
    return 'Под заказ';
  }
  if (availabilityStatus.value === 'expected') {
    return 'Ожидаем поступления';
  }
  return ''
})

// --- Reviews summary (stored locally in browser, see ProductReviewsBasic)
// IMPORTANT: these refs must be declared BEFORE any immediate watchers that can call loadReviewSummary(),
// otherwise we can hit TDZ errors on client hydration.
const reviewCount = ref(0)
const reviewAvg = ref(0)
const questionsCount = computed(() => {
  // reserved for future API field
  const v = (product.value as any)?.questionsCount
  return Number.isFinite(Number(v)) ? Number(v) : 0
})

function loadReviewSummary() {
  if (!process.client) return
  try {
    const key = `reviews:${product.value?.id ?? ''}`
    const raw = window.localStorage.getItem(key)
    const list = raw ? JSON.parse(raw) : []
    const arr = Array.isArray(list) ? list : []
    reviewCount.value = arr.length
    if (!arr.length) {
      reviewAvg.value = 0
      return
    }
    const sum = arr.reduce((acc: number, r: any) => acc + (Number(r?.rating) || 0), 0)
    reviewAvg.value = Math.round((sum / arr.length) * 10) / 10
  } catch {
    reviewCount.value = 0
    reviewAvg.value = 0
  }
}

const displayedRating = computed(() => {
  const api = Number((product.value as any)?.rating)
  if (Number.isFinite(api) && api > 0) return Math.round(api * 10) / 10
  return reviewAvg.value
})

const displayedReviewCount = computed(() => {
  const api = Number((product.value as any)?.reviewsCount)
  if (Number.isFinite(api) && api > 0) return Math.trunc(api)
  return reviewCount.value
})

const availabilityHint = computed(() => {
  // legacy fallback only (if backend doesn't provide availabilityStatus yet)
  const specs = (product.value as any)?.specs
  return (specs?.['Наличие'] ?? specs?.availability ?? null) as string | null
})

watch(
  product,
  (p) => {
    if (!process.client || !p) return
    addRecentlyViewed({
      id: p.id,
      slug: p.slug ?? null,
      name: p.name,
      retailPrice: String(p.retailPrice ?? p.price),
      wholesalePrice: p.wholesalePrice ?? null,
      imageUrl: images.value[0]?.url ?? null,
      categoryName: p.category?.name ?? null,
    })

    // remember categories the user looked at (for homepage recommendations)
    if (p.category?.slug) {
      addRecentCategory(p.category.slug, p.category?.name)
    }

    loadReviewSummary()
  },
  { immediate: true }
)

// Similar products by category
const similar = ref<any[]>([])
const similarPending = ref(false)

// Recommended products from other categories
const recommended = ref<any[]>([])
const recommendedPending = ref(false)

watch(
  () => product.value?.category?.slug,
  async (catSlug) => {
    if (!catSlug || !product.value) {
      similar.value = []
      return
    }
    similarPending.value = true
    try {
      const res = await $fetch<any>('/api/catalog/products', {
        baseURL: apiBaseUrl,
        query: {
          category: catSlug,
          sort: 'popularity',
          limit: '8',
          page: '1',
        },
      })
      const items = Array.isArray(res?.products) ? res.products : []
      similar.value = items.filter((x: any) => x?.id !== product.value?.id).slice(0, 6)
    } catch {
      similar.value = []
    } finally {
      similarPending.value = false
    }
  },
  { immediate: true }
)

watch(
  () => ({
    productId: product.value?.id,
    categorySlug: product.value?.category?.slug,
  }),
  async (ctx) => {
    if (!ctx.productId) {
      recommended.value = []
      return
    }
    recommendedPending.value = true
    try {
      // take a wider slice and filter client-side to ensure different categories
      const res = await $fetch<any>('/api/catalog/products', {
        baseURL: apiBaseUrl,
        query: {
          sort: 'popularity',
          limit: '24',
          page: '1',
        },
      })
      const items = Array.isArray(res?.products) ? res.products : []
      const filtered = items
        .filter((x: any) => x?.id !== ctx.productId)
        .filter((x: any) => {
          const slug = x?.category?.slug
          return ctx.categorySlug ? slug && slug !== ctx.categorySlug : true
        })
      recommended.value = filtered.slice(0, 4)
    } catch {
      recommended.value = []
    } finally {
      recommendedPending.value = false
    }
  },
  { immediate: true }
)

const addingToCart = ref(false)
const addError = ref<string | null>(null)

const qty = ref(1)

const { push: pushToast } = useToast()

const reviewsElId = computed(() => `reviews_${id.value}`)
const detailsElId = computed(() => `details_${id.value}`)

function scrollToReviews() {
  if (!process.client) return
  const el = document.getElementById(reviewsElId.value)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToDetails(tab: 'description' | 'specs') {
  detailsTab.value = tab
  if (!process.client) return
  requestAnimationFrame(() => {
    const el = document.getElementById(detailsElId.value)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const detailsTab = ref<'description' | 'specs'>('description')

const descExpanded = ref(false)
const descriptionText = computed(() => {
  const t = String(product.value?.description ?? '').trim()
  return t
})
const descriptionNeedsClamp = computed(() => descriptionText.value.length > 420)
const descriptionShown = computed(() => {
  if (!descriptionText.value) return ''
  if (descExpanded.value) return descriptionText.value
  return descriptionNeedsClamp.value ? `${descriptionText.value.slice(0, 420).trim()}…` : descriptionText.value
})

const descriptionPreview = computed(() => {
  const d = String(product.value?.description ?? '').trim()
  if (!d) return ''
  return d.length > 420 ? `${d.slice(0, 420)}…` : d
})

const inCartItem = computed(() => cartStore.items.find((i) => i.product.id === (product.value?.id ?? -1)) || null)
const inCartQty = computed(() => inCartItem.value?.quantity ?? 0)

// --- Specs presentation (like marketplace card with modal "Характеристики")
type SpecGroup = { title: string; keys: Array<{ key: string; label: string }> }

const SPEC_GROUPS: SpecGroup[] = [
  {
    title: 'Особенности',
    keys: [
      { key: 'Набор', label: 'Набор' },
      { key: 'Цвет', label: 'Цвет' },
      { key: 'Объём, л', label: 'Объём, л' },
      { key: 'Объём, мл', label: 'Объём, мл' },
      { key: 'Вид упаковки', label: 'Вид упаковки' },
      { key: 'Рисунок', label: 'Рисунок' },
      { key: 'Крышка', label: 'Крышка' },
      { key: 'Материал крышки', label: 'Материал крышки' },
      { key: 'Материал', label: 'Материал' },
      { key: 'Герметичная крышка', label: 'Герметичная крышка' },
      { key: 'Для детей до 3 лет', label: 'Для детей до 3 лет' },
      { key: 'Можно мыть в посудомоечной машине', label: 'Можно мыть в посудомоечной машине' },
      { key: 'Можно использовать в СВЧ-печи', label: 'Можно использовать в СВЧ-печи' },
      { key: 'Текстура', label: 'Текстура' },
      { key: 'Назначение', label: 'Назначение' },
      { key: 'Особенности товара', label: 'Особенности' },
    ],
  },
  {
    title: 'Габариты и вес',
    keys: [
      { key: 'Размер (Д × Ш × В, см)', label: 'Размер (Д × Ш × В, см)' },
      { key: 'Вес брутто, г', label: 'Вес брутто, г' },
      // показываем системный вес тоже, если задан
      { key: '__weight', label: 'Вес (служебный), кг' },
    ],
  },
  {
    title: 'Упаковка и фасовка',
    keys: [
      { key: 'В боксе', label: 'В боксе' },
      { key: 'Фасовка', label: 'Фасовка' },
      { key: 'Индивидуальная упаковка', label: 'Индивидуальная упаковка' },
      { key: 'Размер упаковки (Д × Ш × В, см)', label: 'Размер упаковки (Д × Ш × В, см)' },
    ],
  },
  {
    title: 'Общие',
    keys: [
      { key: '__article', label: 'Артикул' },
      { key: 'Сертификат', label: 'Сертификат' },
      { key: 'Страна производитель', label: 'Страна производитель' },
      { key: 'Состав', label: 'Состав' },
      { key: 'Серия', label: 'Серия' },
    ],
  },
]

const specsModalOpen = ref(false)



function safeStr(v: any) {
  const s = String(v ?? '').trim()
  return s ? s : null
}

function formatWeight(kg?: number | null) {
  if (kg === null || kg === undefined || Number.isNaN(Number(kg))) return null
  const n = Number(kg)
  if (n < 1) return `${Math.round(n * 1000)} г`
  return `${n} кг`
}

const specsData = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}
  const s = (product.value as any)?.specs
  if (s && typeof s === 'object') {
    for (const [k, v] of Object.entries(s)) {
      const val = safeStr(v)
      if (val) out[k] = val
    }
  }
  // inject system fields
  const w = formatWeight((product.value as any)?.weight)
  if (w) out['__weight'] = w
  const art = safeStr((product.value as any)?.article)
  if (art) out['__article'] = art
  return out
})

const groupedSpecs = computed(() => {
  const out: Array<{ title: string; rows: Array<{ label: string; value: string }> }> = []
  const s = specsData.value
  for (const g of SPEC_GROUPS) {
    const rows = g.keys
      .map((k) => ({ label: k.label, value: s[k.key] }))
      .filter((x) => !!x.value)
    if (rows.length) out.push({ title: g.title, rows: rows as any })
  }

  // show any extra keys not in schema at the end
  const known = new Set(SPEC_GROUPS.flatMap((g) => g.keys.map((k) => k.key)))
  const extras = Object.keys(s)
    .filter((k) => !known.has(k))
    .sort((a, b) => a.localeCompare(b))
    .map((k) => ({ label: k, value: s[k] }))
  if (extras.length) out.push({ title: 'Дополнительно', rows: extras })
  return out
})

const quickSpecs = computed(() => {
  const s = specsData.value
  const pick = [
    { key: '__article', label: 'Артикул' },
    { key: 'Сертификат', label: 'Сертификат' },
    { key: 'Страна производитель', label: 'Страна производитель' },
    { key: 'Состав', label: 'Состав' },
    { key: 'Серия', label: 'Серия' },
  ]
  return pick.map((p) => ({ ...p, value: s[p.key] })).filter((x) => !!x.value)
})

watch(
  () => inCartQty.value,
  (q) => {
    // если товара нет в корзине — держим локально минимально 1
    if (q <= 0 && qty.value < 1) qty.value = 1
  },
  { immediate: true }
)

function addToCart() {
  if (!product.value || !canOrder.value) return
  addError.value = null
  addingToCart.value = true
  try {
    cartStore.addItem(
      {
        id: product.value.id,
        name: product.value.name,
        price: Number(product.value.price),
        wholesalePrice:
          product.value.wholesalePrice == null ? null : Number(product.value.wholesalePrice),
        article: product.value.article,
        imageUrl: images.value[0]?.url ?? null,
        categorySlug: product.value?.category?.slug ?? null,
        categoryName: product.value?.category?.name ?? null,
      },
      Math.max(1, qty.value)
    )

    pushToast({
      type: 'success',
      title: 'Добавлено в корзину',
      message: `${product.value.name} • ${Math.max(1, qty.value)} шт.`,
    })
  } catch (e) {
    addError.value = 'Не удалось добавить товар в корзину'
    pushToast({
      type: 'error',
      title: 'Ошибка',
      message: 'Не удалось добавить товар в корзину',
    })
  } finally {
    addingToCart.value = false
  }
}

function decQty() {
  if (!product.value) return
  // если товар уже в корзине — уменьшаем прямо там, а 0 -> удаление
  if (inCartQty.value > 0) {
    const next = inCartQty.value - 1
    if (next <= 0) {
      cartStore.removeItem(product.value.id)
      pushToast({
        type: 'info',
        title: 'Удалено из корзины',
        message: product.value.name,
      })
    } else {
      cartStore.setQuantity(product.value.id, next)
    }
    return
  }
  // если ещё не в корзине — меняем локально, минимум 1
  qty.value = Math.max(1, qty.value - 1)
}

function incQty() {
  if (!product.value) return
  if (inCartQty.value > 0) {
    cartStore.setQuantity(product.value.id, inCartQty.value + 1)
    return
  }
  qty.value = qty.value + 1
}

function removeFromCart() {
  if (!product.value) return
  cartStore.removeItem(product.value.id)
  pushToast({
    type: 'info',
    title: 'Удалено из корзины',
    message: product.value.name,
  })
}

function starFill(idx: number) {
  // idx: 1..5
  const r = Math.max(0, Math.min(5, Number(displayedRating.value) || 0))
  const full = r - (idx - 1)
  return Math.max(0, Math.min(1, full))
}
</script>

<template>
  <section v-if="pending" class="text-sm text-gray-500">
    Загрузка товара...
  </section>

  <section v-else-if="error || !product" class="text-sm text-gray-500">
    Товар не найден
  </section>

  <section v-else class="space-y-4">
    <!-- Хлебные крошки: как на других страницах каталога -->
    <nav class="text-xs text-gray-500">
      <NuxtLink to="/catalog" class="hover:text-slate-900">Каталог</NuxtLink>
      <template v-for="bc in breadcrumbs" :key="bc.slug">
        <span class="mx-1">/</span>
        <NuxtLink :to="`/catalog/${bc.slug}`" class="hover:text-slate-900">
          {{ bc.name }}
        </NuxtLink>
      </template>
      <span v-if="product?.name" class="mx-1">/</span>
      <span v-if="product?.name" class="text-gray-900 font-medium">
        {{ product.name }}
      </span>
    </nav>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_340px] items-start">
      <!-- Галерея изображений -->
      <ProductGallery :images="images" :alt="product.name" />

      <!-- Основная информация -->
      <div class="space-y-4">
        <header class="space-y-2">
          <h1 class="text-xl font-semibold leading-snug">
            {{ product.name }}
          </h1>

          <!-- Rating / reviews like marketplace -->
          <div class="flex flex-wrap items-center gap-3 text-sm">
            <button type="button" class="inline-flex items-center gap-2" @click="scrollToReviews">
              <span class="inline-flex items-center gap-0.5">
                <span v-for="i in 5" :key="i" class="relative inline-flex">
                  <svg width="16" height="16" viewBox="0 0 20 20" class="block">
                    <defs>
                      <linearGradient :id="`g_${product.id}_${i}`" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stop-color="#facc15" />
                        <stop :offset="`${starFill(i) * 100}%`" stop-color="#facc15" />
                        <stop :offset="`${starFill(i) * 100}%`" stop-color="#e5e7eb" />
                        <stop offset="100%" stop-color="#e5e7eb" />
                      </linearGradient>
                    </defs>
                    <path
                      :fill="`url(#g_${product.id}_${i})`"
                      d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"
                    />
                  </svg>
                </span>
              </span>
              <span class="font-semibold text-gray-900">{{ displayedRating || 0 }}</span>
            </button>

            <button type="button" class="text-xs text-gray-500 hover:text-slate-900" @click="scrollToReviews">
              {{ displayedReviewCount }} отзывов
            </button>
            <span class="text-xs text-gray-500">{{ questionsCount }} вопроса</span>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Арт: {{ product.article }}</span>
            <span v-if="product.category">· {{ product.category.name }}</span>
            <span v-if="specsData['Цвет']">· {{ specsData['Цвет'] }}</span>
          </div>
        </header>

        <!-- Quick specs (как на маркетплейсе) -->
        <div v-if="quickSpecs.length" class="rounded-2xl border border-gray-200 bg-white">
          <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="text-sm font-semibold">Характеристики</div>
            <button
              v-if="groupedSpecs.length"
              type="button"
              class="text-xs text-sky-700 hover:underline"
              @click="scrollToDetails('specs')"
            >
              Все характеристики
            </button>
          </div>
          <div class="px-4 py-2">
            <div v-for="row in quickSpecs" :key="row.key" class="grid grid-cols-2 gap-3 py-2 text-sm border-b border-gray-100 last:border-b-0">
              <div class="text-gray-500">{{ row.label }}</div>
              <div class="text-right font-medium text-gray-900">{{ row.value }}</div>
            </div>
          </div>
        </div>

        <!-- Description moved below (tabs like on marketplace) -->
      </div>

      <!-- Price / buy card (sticky on desktop) -->
      <aside class="lg:sticky lg:top-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <ProductPriceBlock
              :retail-price="retailPrice"
              :wholesale-price="wholesalePrice"
              :mode="priceMode"
            />
            <ProductAvailabilityBadge
              :status="availabilityStatus"
              :can-order="canOrder"
              :is-available="isAvailable"
              :hint="availabilityHint"
              :finished-qty="finishedQty"
            />
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="inline-flex items-center rounded-full border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                class="px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                :disabled="!canOrder"
                @click="decQty"
              >
                -
              </button>
              <input
                class="w-14 text-center text-sm py-2 outline-none"
                :value="inCartQty > 0 ? inCartQty : qty"
                readonly
              />
              <button
                type="button"
                class="px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                :disabled="!canOrder"
                @click="incQty"
              >
                +
              </button>
            </div>


            <button
              v-if="inCartQty === 0 && canOrder"
              type="button"
              class="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
              @click="addToCart"
            >
              <span v-if="addingToCart">Добавляем...</span>
              <span v-else>Добавить в корзину</span>
            </button>
            <button
              v-else-if="inCartQty === 0 && !canOrder"
              type="button"
              class="flex-1 inline-flex items-center justify-center rounded-xl bg-gray-300 px-6 py-2 text-sm font-medium text-gray-500 cursor-default select-none"
              disabled
              tabindex="-1"
            >
              Ожидаем поступления
            </button>

            <button
              v-else
              type="button"
              class="flex-1 inline-flex items-center justify-center rounded-xl border border-red-200 text-red-700 px-6 py-2 text-sm font-medium hover:bg-red-50"
              @click="removeFromCart"
            >
              🗑 Удалить
            </button>
          </div>

          <p v-if="addError" class="text-xs text-red-500">
            {{ addError }}
          </p>

          <div v-if="specsData['__weight']" class="text-xs text-gray-500">
            Вес: {{ specsData['__weight'] }}
          </div>
        </div>
      </aside>
    </div>

    <!-- Details tabs (Описание / Характеристики) like on marketplace -->
    <section :id="detailsElId" class="rounded-2xl border border-gray-200 bg-white scroll-mt-24">
      <div class="flex items-center gap-6 px-4 pt-4 border-b border-gray-100">
        <button
          type="button"
          class="relative pb-3 text-sm font-medium"
          :class="detailsTab === 'description' ? 'text-slate-900' : 'text-gray-500 hover:text-slate-900'"
          @click="detailsTab = 'description'"
        >
          Описание
          <span
            v-if="detailsTab === 'description'"
            class="absolute left-0 right-0 -bottom-px h-0.5 bg-sky-600"
          />
        </button>

        <button
          type="button"
          class="relative pb-3 text-sm font-medium"
          :class="detailsTab === 'specs' ? 'text-slate-900' : 'text-gray-500 hover:text-slate-900'"
          @click="detailsTab = 'specs'"
        >
          Характеристики
          <span
            v-if="detailsTab === 'specs'"
            class="absolute left-0 right-0 -bottom-px h-0.5 bg-sky-600"
          />
        </button>
      </div>

      <div class="p-4">
        <div v-if="detailsTab === 'description'" class="space-y-3">
          <div class="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
            <template v-if="descriptionText">
              {{ descriptionShown }}
            </template>
            <template v-else>
              <span class="text-gray-500">Описание отсутствует</span>
            </template>
          </div>

          <button
            v-if="descriptionText && descriptionNeedsClamp"
            type="button"
            class="text-sm text-sky-700 hover:underline"
            @click="descExpanded = !descExpanded"
          >
            {{ descExpanded ? 'Свернуть' : 'Показать полностью' }}
          </button>
        </div>

        <div v-else class="space-y-6">
          <div v-for="g in groupedSpecs" :key="g.title" class="space-y-2">
            <div class="text-sm font-semibold text-gray-900">{{ g.title }}</div>
            <dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              <div v-for="row in g.rows" :key="row.label" class="grid grid-cols-2 gap-3 px-3 py-2 text-sm">
                <dt class="text-gray-500">{{ row.label }}</dt>
                <dd class="font-medium text-gray-900 text-right">{{ row.value }}</dd>
              </div>
            </dl>
          </div>

          <div v-if="!groupedSpecs.length" class="text-sm text-gray-500">Характеристики не заполнены.</div>
        </div>
      </div>
    </section>

    <!-- Modal: full specs -->
    <Teleport to="body">
      <div v-if="specsModalOpen" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/40" @click="specsModalOpen = false" />
        <div class="absolute inset-0 flex items-center justify-center p-4">
          <div class="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-xl">
            <div class="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
              <div class="text-base font-semibold">Характеристики товара</div>
              <button class="px-2 py-1 rounded-lg hover:bg-gray-100" @click="specsModalOpen = false">✕</button>
            </div>
            <div class="p-4 overflow-auto max-h-[calc(85vh-64px)] space-y-6">
              <div v-for="g in groupedSpecs" :key="g.title" class="space-y-2">
                <div class="text-sm font-semibold">{{ g.title }}</div>
                <dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                  <div v-for="row in g.rows" :key="row.label" class="grid grid-cols-2 gap-3 px-3 py-2 text-sm">
                    <dt class="text-gray-500">{{ row.label }}</dt>
                    <dd class="font-medium text-gray-900 text-right">{{ row.value }}</dd>
                  </div>
                </dl>
              </div>
              <div v-if="!groupedSpecs.length" class="text-sm text-gray-500">Характеристики не заполнены.</div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Recommendations -->
    <section class="space-y-3" v-if="similarPending || similar.length">
      <h2 class="text-base font-semibold">Похожие товары</h2>

      <div v-if="similarPending" class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <ProductCardSkeleton v-for="n in 6" :key="n" />
      </div>

      <div v-else class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <ProductCard v-for="p in similar" :key="p.id" :product="p" :mode="priceMode" :prefetch="true" />
      </div>
    </section>

    <!-- Also recommend (other categories) -->
    <section class="space-y-3" v-if="recommendedPending || recommended.length">
      <h2 class="text-base font-semibold">Также рекомендуем</h2>

      <div v-if="recommendedPending" class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <ProductCardSkeleton v-for="n in 4" :key="n" />
      </div>

      <div v-else class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <ProductCard v-for="p in recommended" :key="p.id" :product="p" :mode="priceMode" :prefetch="true" />
      </div>
    </section>

    <!-- Reviews -->
    <section :id="reviewsElId" class="scroll-mt-24">
      <ProductReviewsBasic :product-id="product.id" :product-name="product.name" />
    </section>

    <!-- Mobile sticky buy bar -->
    <ClientOnly>
      <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div class="min-w-0">
            <div class="text-xs text-gray-500">Цена</div>
            <div class="text-base font-semibold text-slate-900 leading-5">
              {{ priceMode === 'b2b' && wholesalePrice ? wholesalePrice : retailPrice }} ₽
            </div>
          </div>

          <button
            v-if="inCartQty === 0"
            type="button"
            class="ml-auto inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="!canOrder || addingToCart"
            @click="addToCart"
          >
            {{ canOrder ? 'В корзину' : 'Ожидаем поступление' }}
          </button>

          <button
            v-else
            type="button"
            class="ml-auto inline-flex items-center justify-center rounded-xl border border-red-200 text-red-700 px-5 py-2 text-sm font-medium hover:bg-red-50"
            @click="removeFromCart"
          >
            Удалить ({{ inCartQty }})
          </button>
        </div>
      </div>
      <div class="lg:hidden h-16" />
    </ClientOnly>
  </section>
</template>
