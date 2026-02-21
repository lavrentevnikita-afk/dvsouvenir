<script setup lang="ts">
const props = defineProps<{ productIds: number[] }>()

const route = useRoute()
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiBaseUrl : config.public.apiBaseUrl

const priceMode = computed(() => (route.path.startsWith('/b2b') ? 'b2b' : 'retail'))

const pending = ref(false)
const products = ref<any[]>([])

async function load() {
  if (!props.productIds?.length) {
    products.value = []
    return
  }
  pending.value = true
  try {
    // 1) fetch details of items in cart to learn categories
    const details = await Promise.all(
      props.productIds.slice(0, 6).map((id) =>
        $fetch<any>(`/api/catalog/products/${id}`, { baseURL: apiBaseUrl }).catch(() => null)
      )
    )

    const slugs = Array.from(
      new Set(
        details
          .map((d) => d?.product?.category?.slug)
          .filter((x): x is string => typeof x === 'string' && x.length > 0)
      )
    )

    if (!slugs.length) {
      products.value = []
      return
    }

    // 2) fetch popular products in these categories
    const take = slugs.slice(0, 2)
    const lists = await Promise.all(
      take.map((slug) =>
        $fetch<any>('/api/catalog/products', {
          baseURL: apiBaseUrl,
          query: { category: slug, sort: 'popularity', limit: '8', page: '1' },
        }).catch(() => ({ products: [] }))
      )
    )

    const flat = lists.flatMap((r) => (Array.isArray(r?.products) ? r.products : []))
    const exclude = new Set(props.productIds)
    const uniq: any[] = []
    const seen = new Set<number>()
    for (const p of flat) {
      if (!p?.id) continue
      if (exclude.has(p.id)) continue
      if (seen.has(p.id)) continue
      seen.add(p.id)
      uniq.push(p)
      if (uniq.length >= 6) break
    }
    products.value = uniq
  } finally {
    pending.value = false
  }
}

onMounted(load)
watch(() => props.productIds.join(','), load)
</script>

<template>
  <section v-if="pending || products.length" class="space-y-3">
    <h2 class="text-base font-semibold">С этим покупают</h2>

    <div v-if="pending" class="grid gap-3 grid-cols-2 md:grid-cols-3">
      <ProductCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <div v-else class="grid gap-3 grid-cols-2 md:grid-cols-3">
      <ProductCard v-for="p in products" :key="p.id" :product="p" :mode="priceMode" :prefetch="true" />
    </div>
  </section>
</template>
