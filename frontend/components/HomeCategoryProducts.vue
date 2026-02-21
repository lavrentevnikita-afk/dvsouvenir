<script setup lang="ts">
import ProductCardGrid from '~/components/ProductCardGrid.vue'

const props = defineProps<{
  category: {
    id?: number
    slug: string
    name: string
  }
  limit?: number
}>()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiBaseUrl : config.public.apiBaseUrl

const auth = useAuthStore()
auth.initFromStorage()

const mode = computed(() => (auth.user?.role === 'store' ? 'b2b' : 'retail'))
const limit = computed(() => props.limit ?? 12)

const products = ref<any[]>([])
const pending = ref(false)

async function fetchCategoryProducts() {
  const slug = String(props.category?.slug || '').trim()
  if (!slug) {
    products.value = []
    return
  }

  pending.value = true
  try {
    const res = await $fetch<any>('/api/catalog/products', {
      baseURL: apiBaseUrl,
      query: {
        category: slug,
        limit: limit.value,
        page: 1,
      },
    }).catch(() => ({ products: [] }))

    products.value = Array.isArray(res?.products) ? res.products : []
  } finally {
    pending.value = false
  }
}

watch(
  () => props.category?.slug,
  () => fetchCategoryProducts(),
  { immediate: true },
)
</script>

<template>
  <section v-if="products.length || pending" class="space-y-4">
    <div class="flex items-end justify-between gap-3">
      <h2 class="text-2xl font-semibold tracking-tight">
        {{ category.name }}
      </h2>
      <NuxtLink
        :to="`/catalog/${category.slug}`"
        class="text-xs text-gray-500 hover:text-gray-800"
      >
        Смотреть все →
      </NuxtLink>
    </div>

    <div v-if="pending" class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <ProductCardSkeleton v-for="i in 10" :key="i" />
    </div>

    <ProductCardGrid v-else :products="products" :mode="mode" view="medium" :prefetch="false" />
  </section>
</template>