<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav class="flex items-center gap-2 text-sm mb-4">
    <NuxtLink 
      to="/admin" 
      class="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
    >
      <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span class="hidden sm:inline">Главная</span>
    </NuxtLink>

    <template v-for="(item, idx) in items" :key="idx">
      <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      
      <NuxtLink 
        v-if="item.to && idx < items.length - 1"
        :to="item.to"
        class="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <span v-if="item.icon" class="text-base">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </NuxtLink>
      
      <span 
        v-else 
        class="flex items-center gap-1.5 text-gray-900 font-medium"
      >
        <span v-if="item.icon" class="text-base">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </span>
    </template>
  </nav>
</template>
