<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const auth = useAuthStore()
auth.initFromStorage()

const cartStore = useCartStore()

onMounted(() => {
  cartStore.initFromStorage()
})

const props = defineProps<{
  product: any
  view?: 'large' | 'medium' | 'list'
  mode?: 'retail' | 'b2b'
  prefetch?: boolean
}>()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

function normalize(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const normalized = url.startsWith('/') ? url : `/${url}`
  return `${apiBaseUrl}${normalized}`
}

const view = computed(() => props.view ?? 'medium')

const gallery = computed(() => (Array.isArray(props.product?.images) ? props.product.images : []).map((i: any) => ({ ...i, url: normalize(String(i?.url || '')) })))
const activeImg = ref(0)

// "Scrub" style image switcher: move cursor across the image to change photo.
// We limit indicator bars so the UI doesn't explode when there are many images.
const hoverSegs = computed(() => {
  const len = gallery.value?.length ?? 0
  return Math.min(len, 5)
})

const activeSeg = computed(() => {
  const len = gallery.value?.length ?? 0
  const segs = hoverSegs.value
  if (len <= 1 || segs <= 1) return 0
  return Math.min(segs - 1, Math.floor((activeImg.value / (len - 1)) * segs))
})

function setActiveByPointer(e: MouseEvent | TouchEvent) {
  const len = gallery.value?.length ?? 0
  const segs = hoverSegs.value
  if (len <= 1 || segs <= 1) return

  const el = e.currentTarget as HTMLElement | null
  if (!el) return
  const rect = el.getBoundingClientRect()

  const clientX = (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX
  const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
  const seg = Math.min(segs - 1, Math.floor((x / rect.width) * segs))

  // Map segment to actual image index.
  const idx = Math.min(len - 1, Math.round((seg / (segs - 1)) * (len - 1)))
  activeImg.value = idx
}

watch(
  () => props.product?.id,
  () => {
    activeImg.value = 0
  },
)

const imageUrl = computed(() => gallery.value?.[activeImg.value]?.url || gallery.value?.[0]?.url || null)

const isB2B = computed(() =>
  (props.mode === 'b2b') || route.path.startsWith('/b2b') || auth.user?.role === 'store'
)

const ctxMode = computed(() => (isB2B.value ? 'b2b' : 'retail') as const)
const to = computed(() => `/product/${props.product?.id}`)

const retailPrice = computed(() => props.product?.retailPrice ?? props.product?.price)
const wholesalePrice = computed(() => {
  // Server is the single source of truth.
  // For stores: API returns priceInfo.final / wholesalePrice already discounted.
  if (isB2B.value && props.product?.priceInfo?.final != null) return props.product.priceInfo.final
  const direct = props.product?.wholesalePrice ?? null
  return direct
})

const oldPrice = computed(() => {
  const candidates = [
    (props.product as any)?.oldPrice,
    (props.product as any)?.previousPrice,
    (props.product as any)?.compareAtPrice,
    (props.product as any)?.retailOldPrice,
  ]
  const cur = Number(retailPrice.value)
  for (const c of candidates) {
    const v = Number(c)
    if (Number.isFinite(v) && v > cur) return v
  }
  return null
})

const discountPercent = computed(() => {
  if (!oldPrice.value) return null
  const cur = Number(retailPrice.value)
  const old = Number(oldPrice.value)
  if (!Number.isFinite(cur) || !Number.isFinite(old) || old <= 0 || old <= cur) return null
  return Math.round(((old - cur) / old) * 100)
})

const isNew = computed(() => Boolean((props.product as any)?.isNew || (props.product as any)?.new))
const isPromo = computed(() => Boolean((props.product as any)?.isPromo || (props.product as any)?.promo))

const displayedRating = computed(() => {
  const api = Number((props.product as any)?.rating)
  if (Number.isFinite(api) && api > 0) return Math.round(api * 10) / 10
  return 0
})

const displayedReviewCount = computed(() => {
  const api = Number((props.product as any)?.reviewsCount)
  if (Number.isFinite(api) && api > 0) return Math.trunc(api)
  return 0
})

function reviewsLabel(n: number) {
  // 1 отзыв, 2/3/4 отзыва, 5+ отзывов
  const v = Math.abs(n) % 100
  const n1 = v % 10
  if (v > 10 && v < 20) return 'отзывов'
  if (n1 > 1 && n1 < 5) return 'отзыва'
  if (n1 === 1) return 'отзыв'
  return 'отзывов'
}

function toSnapshot() {
  return {
    id: Number(props.product.id),
    name: String(props.product.name || ''),
    price: Number(props.product.price),
    wholesalePrice: props.product.wholesalePrice == null ? null : Number(props.product.wholesalePrice),
    article: props.product.article,
    imageUrl: gallery.value?.[0]?.url || null,
    categorySlug: props.product?.category?.slug ?? null,
    categoryName: props.product?.category?.name ?? null,
  }
}

const qty = computed(() => {
  const id = Number(props.product?.id)
  const it = cartStore.items.find((i) => i.product.id === id)
  return it?.quantity ?? 0
})

function addOne(e?: Event) {
  e?.preventDefault()
  e?.stopPropagation()
  cartStore.addItem(toSnapshot(), 1)
}

function removeOne(e?: Event) {
  e?.preventDefault()
  e?.stopPropagation()
  const id = Number(props.product?.id)
  if (!id) return
  if (qty.value <= 1) cartStore.removeItem(id)
  else cartStore.setQuantity(id, qty.value - 1)
}

function addFirst(e?: Event) {
  e?.preventDefault()
  e?.stopPropagation()
  cartStore.addItem(toSnapshot(), 1)
}

const cardBase = computed(() => {
  // Shared "your project" visual language: rounded, light border, subtle hover.
  return 'group relative rounded-xl border border-gray-200 bg-white text-sm transition hover:border-slate-300 hover:shadow-sm'
})

const pad = computed(() => (view.value === 'large' ? 'p-3' : view.value === 'medium' ? 'p-3' : 'p-3'))

const imageWrapClass = computed(() => {
  // All product photos should be 1:1 (except banners).
  if (view.value === 'large') return 'aspect-square'
  if (view.value === 'medium') return 'aspect-square'
  return 'h-16 w-16 aspect-square'
})

const titleClass = computed(() => {
  if (view.value === 'large') return 'text-[15px] font-medium text-gray-900 line-clamp-2'
  if (view.value === 'medium') return 'text-[14px] font-medium text-gray-900 line-clamp-2'
  return 'text-[14px] font-medium text-gray-900 line-clamp-2'
})

const priceClass = computed(() => {
  if (view.value === 'large') return 'text-lg font-semibold text-gray-900'
  if (view.value === 'medium') return 'text-base font-semibold text-gray-900'
  return 'text-base font-semibold text-gray-900'
})

function StarRow() {
  // no-op: placeholder for template-only use
  return null as any
}
</script>

<template>
  <!-- LIST VIEW -->
  <article v-if="view === 'list'" :class="[cardBase, pad]">
    <div class="flex gap-3">
      <NuxtLink :to="to" :prefetch="prefetch" class="flex gap-3 flex-1 min-w-0">
        <div
          class="flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center"
          :class="imageWrapClass"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="product.name"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <div v-else class="text-[11px] text-gray-400">Нет фото</div>
        </div>

        <div class="min-w-0">
          <p :class="titleClass">{{ product.name }}</p>
          <div class="mt-1 space-y-0.5">
            <p v-if="product.category?.name" class="text-xs text-gray-500">{{ product.category?.name }}</p>
            <p v-if="product.article" class="text-[11px] text-gray-400">Арт: {{ product.article }}</p>
          </div>
        </div>
      </NuxtLink>

      <div class="w-36 flex-shrink-0 flex flex-col items-end gap-2">
        <div class="text-right w-full">
          <ProductPriceBlock :retail-price="retailPrice" :wholesale-price="wholesalePrice" compact />
        </div>

        <div class="flex items-center justify-end gap-2">
          <div class="flex items-center gap-1 text-xs text-gray-600" v-if="displayedRating">
            <svg viewBox="0 0 24 24" class="w-6 h-6" fill="currentColor" aria-hidden="true">
              <path d="M12 17.3l-6.18 3.25 1.18-6.9L1.99 8.8l6.92-1L12 1.5l3.09 6.3 6.92 1-5.01 4.85 1.18 6.9z" />
            </svg>
            <span class="font-medium text-gray-800">{{ displayedRating }}</span>
            <span v-if="displayedReviewCount" class="text-gray-400">• {{ displayedReviewCount }} {{ reviewsLabel(displayedReviewCount) }}</span>
          </div>

          <!-- Кнопка избранного удалена -->
        </div>

        <div class="w-full flex justify-end">
          <template v-if="auth.isAuthenticated">
            <div v-if="qty === 0" class="w-full">
              <BaseButton
                variant="primary"
                size="sm"
                full-width
                @click="addFirst"
              >
                В корзину
              </BaseButton>
            </div>

            <div v-else class="inline-flex items-center overflow-hidden rounded-full border border-gray-200 bg-white">
              <button type="button" class="h-9 w-10 hover:bg-gray-50" @click="removeOne">−</button>
              <div class="h-9 min-w-[2.5rem] flex items-center justify-center text-sm font-medium text-gray-900">
                {{ qty }}
              </div>
              <button type="button" class="h-9 w-10 hover:bg-gray-50" @click="addOne">+</button>
            </div>
          </template>
          <template v-else>
            <BaseButton
              variant="primary"
              size="sm"
              full-width
              @click="addFirst"
            >
              В корзину
            </BaseButton>
          </template>
        </div>
      </div>
    </div>
  </article>

  <!-- GRID (LARGE / MEDIUM) -->
  <article v-else :class="[cardBase, pad, 'flex flex-col']">
    <!-- overlays -->
    <!-- Кнопка избранного удалена -->

    <div class="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
      <span
        v-if="discountPercent"
        class="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700"
      >
        −{{ discountPercent }}%
      </span>
      <span v-if="isNew" class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">New</span>
      <span v-if="isPromo" class="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">Акция</span>
    </div>

    <NuxtLink :to="to" :prefetch="prefetch" class="space-y-2">
      <div
        class="relative w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center"
        :class="'aspect-square'"
        @mousemove="setActiveByPointer"
        @touchmove.passive="setActiveByPointer"
        @mouseleave="activeImg = 0"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="product.name"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <div v-else class="text-[11px] text-gray-400">Нет фото</div>

        <!-- Scrub bars (like on the screenshot): indicates segments while hovering to switch photos -->
        <div v-if="gallery.length > 1" class="pointer-events-none absolute left-2 right-2 top-2 flex gap-1">
          <span
            v-for="n in hoverSegs"
            :key="n"
            class="h-1 flex-1 rounded-full"
            :class="(n - 1) === activeSeg ? 'bg-slate-900/80' : 'bg-white/70'"
          />
        </div>
      </div>

      <div class="space-y-1">
        <ProductPriceBlock :retail-price="retailPrice" :wholesale-price="wholesalePrice" />

        <p :class="titleClass">{{ product.name }}</p>
        <p v-if="product.article" class="text-[11px] text-gray-400">Арт: {{ product.article }}</p>

        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1 text-xs text-gray-600">
            <template v-if="displayedRating">
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12 17.3l-6.18 3.25 1.18-6.9L1.99 8.8l6.92-1L12 1.5l3.09 6.3 6.92 1-5.01 4.85 1.18 6.9z" />
              </svg>
              <span class="font-medium text-gray-800">{{ displayedRating }}</span>
              <span v-if="displayedReviewCount" class="text-gray-400">• {{ displayedReviewCount }} {{ reviewsLabel(displayedReviewCount) }}</span>
            </template>
            <span v-else class="text-gray-400">—</span>
          </div>
          <span v-if="product.category?.name && view === 'medium'" class="text-[11px] text-gray-400 truncate">{{ product.category?.name }}</span>
        </div>
      </div>
    </NuxtLink>

    <div class="mt-auto pt-2">
      <div v-if="qty === 0">
        <BaseButton
          variant="primary"
          size="md"
          full-width
          @click="addFirst"
        >
          В корзину
        </BaseButton>
        <!-- убрано: надпись про под заказ -->
      </div>

      <div v-else class="inline-flex w-full items-center justify-between overflow-hidden rounded-full border border-gray-200 bg-white">
        <button type="button" class="h-10 w-12 hover:bg-gray-50" @click="removeOne">−</button>
        <div class="h-10 flex-1 flex items-center justify-center text-sm font-semibold text-gray-900">{{ qty }}</div>
        <button type="button" class="h-10 w-12 hover:bg-gray-50" @click="addOne">+</button>
      </div>
    </div>
  </article>
</template>
