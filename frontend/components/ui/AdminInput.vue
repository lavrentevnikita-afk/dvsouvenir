<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  placeholder?: string
  type?: 'text' | 'number' | 'date' | 'email' | 'password'
  icon?: 'search' | 'calendar' | 'filter'
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <div class="relative">
    <svg
      v-if="icon === 'search'"
      class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <svg
      v-else-if="icon === 'calendar'"
      class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <svg
      v-else-if="icon === 'filter'"
      class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
    <input
      :value="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      :class="[
        'w-full py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm',
        'focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all',
        'placeholder:text-slate-400',
        icon ? 'pl-10 pr-3' : 'px-3'
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
