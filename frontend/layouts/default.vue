<script setup lang="ts">
import CityPicker from '~/components/CityPicker.vue'
import { useCityStore } from '~/stores/city'
const router = useRouter()

// Быстрые ссылки под хедером: Акции / Новинки / (актуальный праздник) + категории
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiBaseUrl : config.public.apiBaseUrl

type HeaderCategory = {
  id: number
  name: string
  slug: string
  productsCount?: number
  children?: HeaderCategory[]
}


const { data: headerCategories } = await useAsyncData('header-categories', () =>
  $fetch<{ categories: HeaderCategory[] }>('/api/catalog/categories', {
    baseURL: apiBaseUrl
  })
)

const { data: fallbackCategories } = await useAsyncData('fallback-categories', () =>
  $fetch<{ categories: HeaderCategory[] }>('/api/catalog/categories', {
    baseURL: apiBaseUrl
  })
)

const categoriesTree = computed(() => {
  if (headerCategories.value?.categories?.length) return headerCategories.value.categories
  if (fallbackCategories.value?.categories?.length) return fallbackCategories.value.categories
  return []
})

// В подхедере показываем ограниченное число категорий справа.
// Лимит зависит от заполнения (есть ли сезонный праздник):
// - с праздником меньше места → 5
// - без праздника → 6
// Порядок — по количеству товаров (desc).
const sortedParentCategories = computed(() => {
  // Только корневые (parent == null)
  return categoriesTree.value
    .filter(c => c.isActive !== false)
    .sort((a, b) => (b.productsCount ?? 0) - (a.productsCount ?? 0))
    .slice(0, 8)
})

// DEBUG: Логируем категории для диагностики пустого подхедера
watchEffect(() => {
  // eslint-disable-next-line no-console
  console.log('headerCategories:', headerCategories.value)
  // eslint-disable-next-line no-console
  console.log('sortedParentCategories:', sortedParentCategories.value)
})


// Catalog dropdown (2-level)
const catalogOpen = ref(false)
const activeRootSlug = ref<string | null>(null)

// Click outside handler for catalog dropdown
const catalogDropdownEl = ref<HTMLElement | null>(null)
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
function handleClickOutside(e: MouseEvent) {
  if (!catalogOpen.value) return
  const dropdown = catalogDropdownEl.value
  if (dropdown && !dropdown.contains(e.target as Node)) {
    catalogOpen.value = false
  }
}

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    catalogOpen.value = false
  },
)

function openCatalog() {
  catalogOpen.value = !catalogOpen.value
  if (catalogOpen.value) {
    activeRootSlug.value = categoriesTree.value?.[0]?.slug ?? null
  }
}

const activeHoliday = computed(() => {
  const now = new Date()
  const m = now.getMonth() + 1
  const d = now.getDate()
  // Простой календарь (можно расширять позже)
  // Новый год: 1 дек — 15 янв
  if ((m === 12 && d >= 1) || (m === 1 && d <= 15)) return 'Новый год'
  // 23 февраля: 15 — 28 фев
  if (m === 2 && d >= 15 && d <= 28) return '23 февраля'
  // 8 марта: 1 — 10 мар
  if (m === 3 && d >= 1 && d <= 10) return '8 марта'
  // 1 сентября: 15 авг — 10 сен
  if ((m === 8 && d >= 15) || (m === 9 && d <= 10)) return '1 сентября'
  return null
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const cityStore = useCityStore()

const cartCount = computed(() => cartStore.totalItems)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.user)
const isB2BUser = computed(() => {
  const role = currentUser.value?.role
  return role === 'store' || role === 'manager'
})

onMounted(() => {
  cartStore.initFromStorage()
  authStore.initFromStorage()
  cityStore.init()
})

function onLogout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header must always be above any page content (promo, cards, etc.) -->
    <header class="sticky top-0 z-[1000] bg-white border-b border-gray-200">
      <div
        class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4"
      >
        <!-- Logo & main nav -->
        <div class="flex items-center gap-4">
          <NuxtLink to="/" class="flex items-center gap-2">
            <img src="/logo.svg" alt="Дальневосточный Сувенир" class="h-8 w-auto" style="max-width:120px;" />
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-3 text-xs font-medium text-gray-600">
            <!-- Catalog dropdown -->
            <div class="relative">
              <button
                type="button"
                class="inline-flex items-center gap-1 hover:text-slate-900 transition-colors"
                :class="{ 'text-slate-900': catalogOpen }"
                @click="openCatalog"
              >
                <span>Каталог</span>
                <svg viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <div
                v-if="catalogOpen"
                class="absolute left-0 mt-2 w-[560px] rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"
                ref="catalogDropdownEl"
              >
                <div class="grid grid-cols-2">
                  <!-- roots -->
                  <div class="border-r border-gray-100 p-2 max-h-[360px] overflow-auto">
                    <button
                      v-for="c in categoriesTree"
                      :key="c.slug"
                      type="button"
                      class="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-50"
                      :class="{ 'bg-gray-50 text-slate-900 font-semibold': activeRootSlug === c.slug }"
                      @mouseenter="activeRootSlug = c.slug"
                      @focus="activeRootSlug = c.slug"
                    >
                      {{ c.name }}
                    </button>
                  </div>

                  <!-- children -->
                  <div class="p-2 max-h-[360px] overflow-auto">
                    <template v-for="root in categoriesTree" :key="root.slug">
                      <div v-if="root.slug === activeRootSlug" class="space-y-1">
                        <NuxtLink
                          :to="`/catalog/${root.slug}`"
                          class="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-900 hover:bg-gray-50"
                          @click="catalogOpen = false"
                        >
                          Все товары категории
                        </NuxtLink>
                        <div class="h-px bg-gray-100 my-1" />
                        <NuxtLink
                          v-for="ch in (root.children || [])"
                          :key="ch.slug"
                          :to="`/catalog/${ch.slug}`"
                          class="block px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-slate-900"
                          @click="catalogOpen = false"
                        >
                          {{ ch.name }}
                        </NuxtLink>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- B2B кнопка полностью удалена -->
            <NuxtLink
              v-if="isAuthenticated"
              to="/account"
              class="hover:text-slate-900 transition-colors"
              active-class="text-slate-900"
            >
              Мои заказы
            </NuxtLink>
          </nav>
        </div>

        <!-- Search + auth + cart -->
        <div class="flex-1 flex items-center justify-end gap-3">
          <CityPicker />

          <SmartSearchBar />

          <!-- Auth (client-only to avoid SSR hydration mismatches when auth state is restored from storage) -->
          <ClientOnly>
            <div class="flex items-center gap-2 text-xs">
              <template v-if="isAuthenticated && currentUser">
                <div class="hidden sm:flex flex-col items-end leading-tight">
                  <span class="font-medium text-slate-900">
                    {{ currentUser.name }}
                  </span>
                  <span class="text-[11px] text-slate-500">
                    {{ currentUser.email }}
                  </span>
                </div>
                <button
                  type="button"
                  class="text-[11px] font-medium text-slate-700 hover:text-slate-900"
                  @click="router.push('/account')"
                >
                  Кабинет
                </button>
                <button
                  type="button"
                  class="text-[11px] text-red-500 hover:text-red-600"
                  @click="onLogout"
                >
                  Выйти
                </button>
              </template>
              <template v-else>
                <NuxtLink
                  to="/login"
                  class="text-[11px] font-medium text-slate-700 hover:text-slate-900"
                >
                  Войти
                </NuxtLink>
              </template>
            </div>

            <template #fallback>
              <div class="flex items-center gap-2 text-xs">
                <NuxtLink
                  to="/login"
                  class="text-[11px] font-medium text-slate-700 hover:text-slate-900"
                >
                  Войти
                </NuxtLink>
              </div>
            </template>
          </ClientOnly>
          <!-- Favorites (удалено) -->
          <!-- Cart -->
          <NuxtLink
            to="/cart"
            class="inline-flex items-center justify-center rounded-full bg-slate-900 h-9 w-9 text-white relative"
            title="Корзина"
          >
            <svg viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] border border-white"
            >
              {{ cartCount }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Подхедер (как на скрине): Акции / Новинки / Праздник + категории, которые влезут -->
      <div class="bg-slate-900">
        <div
          class="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto"
        >
          <template v-if="sortedParentCategories.length">
            <NuxtLink
              v-for="c in sortedParentCategories"
              :key="c.slug"
              :to="`/catalog/${c.slug}`"
              class="shrink-0 px-2 py-1 text-[12px] font-medium text-white/80 hover:text-white"
              active-class="text-white"
            >
              {{ c.name }}
            </NuxtLink>
          </template>
          <template v-else>
            <span class="text-xs text-red-300">Нет категорий для отображения (проверьте API или данные)</span>
            <div class="text-xs text-yellow-200 mt-2">
              <div>headerCategories: {{ headerCategories }}</div>
              <div>categoriesTree: {{ categoriesTree }}</div>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
      <slot />
    </main>

    <ScrollToTop />

    <!-- Global toasts (add-to-cart, errors, etc.) -->
    <ClientOnly>
      <ToastHost />
    </ClientOnly>
  </div>
</template>
