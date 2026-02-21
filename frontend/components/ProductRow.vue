<script setup lang="ts">
// Backward-compatible wrapper: keep old <ProductRow> usage,
// but render the unified ProductCard in "list" view.

const props = defineProps<{
  product: any
  mode?: 'retail' | 'b2b'
  prefetch?: boolean
}>()
</script>

<template>
  <ProductCard :product="product" :mode="mode" :prefetch="prefetch" view="list" />
</template>
