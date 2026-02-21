<script setup lang="ts">
import { useCityStore } from '~/stores/city'

type SuggestProduct = {
  id: number
  name: string
  article?: string
  images?: { id: number; url: string }[]
  category?: { id: number; name: string; slug: string }
}

type SuggestCategory = {
  id: number
  name: string
  slug: string
  imageUrl?: string | null
}

const props = defineProps<{
  placeholder?: string
  maxWidthClass?: string
}>()

const router = useRouter()
const route = useRoute()
const cityStore = useCityStore()

const term = ref('')
const isOpen = ref(false)
const isLoading = ref(false)
const correctedQuery = ref<string | null>(null)
const products = ref<SuggestProduct[]>([])
const categories = ref<SuggestCategory[]>([])

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiBaseUrl : config.public.apiBaseUrl

function resolveUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${apiBaseUrl}${url}`
}

function firstImage(p: SuggestProduct) {
  const u = p?.images?.[0]?.url
  return resolveUrl(u)
}

let t: any = null
watch(
  () => term.value,
  (v) => {
    correctedQuery.value = null
    const q = v.trim()
    if (!q) {
      products.value = []
      categories.value = []
      isOpen.value = false
      if (t) clearTimeout(t)
      return
    }

    isOpen.value = true
    if (t) clearTimeout(t)
    t = setTimeout(async () => {
      isLoading.value = true
      try {
        const res: any = await $fetch('/api/catalog/suggest', {
          baseURL: apiBaseUrl,
          query: {
            query: q,
            limit: 8,
            ...(cityStore.code ? { city: cityStore.code } : {})
          }
        })
        products.value = res?.products ?? []
        categories.value = res?.categories ?? []
        correctedQuery.value = res?.correctedQuery ?? null
      } catch {
        products.value = []
        categories.value = []
      } finally {
        isLoading.value = false
      }
    }, 150)
  },
  { immediate: true }
)

// Close on route change (so dropdown doesn't hang)
watch(
  () => route.fullPath,
  () => {
    isOpen.value = false
  }
)

function goSearch(q: string) {
  const value = q.trim()
  if (!value) return
  isOpen.value = false
  router.push({ path: '/search', query: { q: value } })
}

function onSubmit() {
  goSearch(term.value)
}

function onPickProduct(id: number) {
  isOpen.value = false
  router.push(`/product/${id}`)
}

function onPickCategory(slug: string) {
  isOpen.value = false
  router.push(`/catalog/${slug}`)
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target?.closest?.('[data-smart-search]')) {
    isOpen.value = false
  }
}

onMounted(() => {
  cityStore.init()
  window.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <div
    data-smart-search
    class="relative hidden md:flex flex-1 items-center"
    :class="maxWidthClass || 'max-w-sm'"
  >
    <form
      class="w-full flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 bg-gray-50"
      @submit.prevent="onSubmit"
    >
      <input
        v-model="term"
        type="text"
        class="flex-1 bg-transparent text-xs outline-none"
        :placeholder="placeholder || 'Поиск по товарам...'"
        @focus="term.trim() && (isOpen = true)"
        autocomplete="off"
      />
      <button
        type="submit"
        class="text-[11px] font-medium text-slate-700 hover:text-slate-900"
      >
        Найти
      </button>
    </form>

    <div
      v-if="isOpen"
      class="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden z-[999]"
    >
      <div v-if="isLoading" class="px-4 py-3 text-xs text-gray-500">
        Ищу…
      </div>

      <div v-else class="max-h-[420px] overflow-auto">
        <button
          v-if="correctedQuery"
          type="button"
          class="w-full text-left px-4 py-2 text-xs bg-gray-50 hover:bg-gray-100 border-b border-gray-200"
          @click="goSearch(correctedQuery)"
        >
          Возможно, вы имели в виду: <span class="font-semibold">{{ correctedQuery }}</span>
        </button>

        <div v-if="categories.length" class="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-500">
          Категории
        </div>
        <button
          v-for="c in categories"
          :key="`c-${c.id}`"
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
          @click="onPickCategory(c.slug)"
        >
          <div class="h-9 w-9 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            <img
              v-if="c.imageUrl"
              :src="resolveUrl(c.imageUrl)"
              :alt="c.name"
              class="h-full w-full object-cover"
            />
            <div v-else class="text-[10px] text-gray-400">#</div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="truncate font-medium text-gray-900">{{ c.name }}</div>
            <div class="truncate text-[11px] text-gray-500">/catalog/{{ c.slug }}</div>
          </div>
        </button>

        <div v-if="products.length" class="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-500">
          Товары
        </div>
        <button
          v-for="p in products"
          :key="p.id"
          type="button"
          class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
          @click="onPickProduct(p.id)"
        >
          <div class="h-9 w-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
            <img
              v-if="firstImage(p)"
              :src="firstImage(p)"
              :alt="p.name"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="truncate font-medium text-gray-900">{{ p.name }}</div>
            <div class="flex items-center gap-2 text-[11px] text-gray-500">
              <span v-if="p.article">Арт: {{ p.article }}</span>
              <span v-if="p.category?.name" class="truncate">— {{ p.category.name }}</span>
            </div>
          </div>
        </button>

        <div v-if="!categories.length && !products.length" class="px-4 py-3 text-xs text-gray-500">
          Ничего не найдено. Попробуйте другое написание.
        </div>
      </div>
    </div>
  </div>
</template>
