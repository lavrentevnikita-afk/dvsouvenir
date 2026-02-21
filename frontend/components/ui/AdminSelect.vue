<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string | number
  options: Array<{ value: string | number; label: string; icon?: string }>
  placeholder?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<template>
  <select
    :value="modelValue"
    class="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all cursor-pointer"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.icon ? opt.icon + ' ' : '' }}{{ opt.label }}
    </option>
  </select>
</template>
