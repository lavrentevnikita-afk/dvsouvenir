
<template>
  <span class="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200">
    <img :src="iconSrc" alt="icon" class="w-6 h-6 object-contain" width="24" height="24" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ icon: string }>()

const iconMap: Record<string, string> = {
  dashboard: '/icons/admin-dashboard.svg',
  catalog: '/icons/admin-catalog.svg',
  orders: '/icons/admin-orders.svg',
  inwork: '/icons/admin-inwork.svg',
  shipments: '/icons/admin-shipments.svg',
  warehouse: '/icons/admin-warehouse.svg',
  stores: '/icons/admin-stores.svg',
  analytics: '/icons/admin-analytics.svg',
  production: '/icons/admin-production.svg',
}

const iconSrc = computed(() => iconMap[props.icon] || '/favicon.svg')
</script>
