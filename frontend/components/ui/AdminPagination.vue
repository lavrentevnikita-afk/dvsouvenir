<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
  totalItems?: number
  perPage?: number
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const displayedPages = computed(() => {
  const pages: (number | '...')[] = []
  const total = props.totalPages
  const current = props.page
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    
    if (current > 3) pages.push('...')
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (current < total - 2) pages.push('...')
    
    pages.push(total)
  }
  
  return pages
})

const startItem = computed(() => {
  if (!props.perPage || !props.totalItems) return null
  return (props.page - 1) * props.perPage + 1
})

const endItem = computed(() => {
  if (!props.perPage || !props.totalItems) return null
  return Math.min(props.page * props.perPage, props.totalItems)
})
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
    <!-- Info -->
    <div v-if="totalItems" class="text-sm text-gray-500">
      Показано <span class="font-medium text-gray-900">{{ startItem }}</span> - 
      <span class="font-medium text-gray-900">{{ endItem }}</span> из 
      <span class="font-medium text-gray-900">{{ totalItems }}</span>
    </div>
    
    <!-- Pages -->
    <div class="flex items-center gap-1">
      <!-- Prev -->
      <button
        :disabled="page <= 1"
        class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="emit('update:page', page - 1)"
      >
        <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <!-- Page buttons -->
      <template v-for="(p, idx) in displayedPages" :key="idx">
        <span v-if="p === '...'" class="px-2 text-gray-400">...</span>
        <button
          v-else
          :class="[
            'min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all',
            p === page 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
          ]"
          @click="emit('update:page', p)"
        >
          {{ p }}
        </button>
      </template>
      
      <!-- Next -->
      <button
        :disabled="page >= totalPages"
        class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="emit('update:page', page + 1)"
      >
        <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
