<script setup lang="ts">
defineProps<{
  title: string
  text?: string
  href?: string
}>()
</script>

<template>
  <div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-sm font-semibold text-amber-900">{{ title }}</p>
        <p v-if="text" class="text-xs text-amber-800">{{ text }}</p>
      </div>
      <NuxtLink v-if="href" :to="href" class="text-xs font-medium text-amber-900 underline">
        Подробнее
      </NuxtLink>
    </div>
  </div>
</template>