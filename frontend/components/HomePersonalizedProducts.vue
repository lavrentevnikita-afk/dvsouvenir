<script setup lang="ts">
import ProductCardGrid from '~/components/ProductCardGrid.vue'

const props = defineProps<{
  title?: string
  limit?: number
}>()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiBaseUrl : config.public.apiBaseUrl

const auth = useAuthStore()
auth.initFromStorage()

const mode = computed(() => (auth.user?.role === 'store' ? 'b2b' : 'retail'))

const { items: recentCats, load: loadRecentCats } = useRecentlyViewedCategories()

const title = computed(() => props.title ?? 'Обратите внимание')
const limit = computed(() => props.limit ?? 12)

const products = ref<any[]>([])
const pending = ref(false)

const fetchPersonalized = async () => {
  if (!process.client) return

  const slugs = recentCats.value
    .map((c) => String(c.slug || '').trim())
    .filter(Boolean)

  // Unique, keep order (most recent first)
  const uniqueSlugs: string[] = []
  for (const s of slugs) {
    if (!uniqueSlugs.includes(s)) uniqueSlugs.push(s)
  }

  if (!uniqueSlugs.length) {
    products.value = []
    return
  }

  // Don’t spam backend: 3 последних категорий обычно достаточно
  const used = uniqueSlugs.slice(0, 3)
  const perCat = Math.max(6, Math.ceil(limit.value / used.length))

  pending.value = true
  try {
    const results = await Promise.all(
      used.map((slug) =>
        $fetch<any>('/api/catalog/products', {
          baseURL: apiBaseUrl,
          query: {
            category: slug,
            limit: perCat,
            page: 1,
          },
        }).catch(() => ({ products: [] })),
      ),
    )

    const merged: any[] = []
    const seen = new Set<number>()
    for (const r of results) {
      const list = Array.isArray(r?.products) ? r.products : []
      for (const p of list) {
        if (!p?.id || seen.has(p.id)) continue
        seen.add(p.id)
        merged.push(p)
      }
    }

    products.value = merged.slice(0, limit.value)
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  loadRecentCats()
  fetchPersonalized()
})

watch(
  () => recentCats.value.map((x) => x.slug).join('|'),
  () => fetchPersonalized(),
)
</script>

<template>
  <section v-if="products.length || pending" class="space-y-4">
    <div class="flex items-end justify-between gap-3">
      <h2 class="text-2xl font-semibold tracking-tight">
        {{ title }}
      </h2>
      <NuxtLink to="/catalog" class="text-xs text-gray-500 hover:text-gray-800">
        Смотреть все →
      </NuxtLink>
    </div>

    <div v-if="pending" class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <ProductCardSkeleton v-for="i in 10" :key="i" />
    </div>

    <ProductCardGrid v-else :products="products" :mode="mode" view="medium" :prefetch="false" />
  </section>
</template>
