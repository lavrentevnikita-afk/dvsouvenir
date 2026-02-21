<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
      <div class="flex items-center gap-3">
        <div v-if="icon" class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-xl shadow-sm">
          {{ icon }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ title }}</h1>
          <p v-if="description" class="text-sm text-slate-500 mt-0.5">{{ description }}</p>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
