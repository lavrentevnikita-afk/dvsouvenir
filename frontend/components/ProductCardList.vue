<script setup lang="ts">
const props = defineProps<{
  products: any[]
  mode?: 'retail' | 'b2b'
  prefetch?: boolean
}>()
</script>

<template>
  <div class="space-y-2">
    <ProductCard
      v-for="p in products"
      :key="p.id"
      :product="p"
      :mode="mode"
      :prefetch="prefetch"
      view="list"
    />
  </div>
</template>
