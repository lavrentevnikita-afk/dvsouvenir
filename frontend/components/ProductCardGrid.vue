<script setup lang="ts">
const props = defineProps<{
  products: any[]
  view?: 'large' | 'medium'
  mode?: 'retail' | 'b2b'
  prefetch?: boolean
}>()

const v = computed(() => props.view ?? 'medium')

const gridClass = computed(() => {
  // large: 3–4 in row (desktop), medium: 4–5 in row (desktop)
  if (v.value === 'large') return 'grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  return 'grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
})
</script>

<template>
  <div :class="gridClass">
    <ProductCard
      v-for="p in products"
      :key="p.id"
      :product="p"
      :mode="mode"
      :prefetch="prefetch"
      :view="v"
    />
  </div>
</template>
