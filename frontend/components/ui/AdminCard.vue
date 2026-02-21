<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  padding?: boolean
}>(), {
  padding: true
})
</script>

<template>
  <div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm">
    <div v-if="title" class="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent rounded-t-2xl">
      <div class="flex items-center justify-between">
        <div class="text-base font-semibold text-slate-800">{{ title }}</div>
        <slot name="header-actions" />
      </div>
    </div>
    <div :class="[padding ? 'p-5' : '', !title ? 'rounded-2xl' : 'rounded-b-2xl']">
      <slot />
    </div>
  </div>
</template>
