<script setup lang="ts">
defineProps<{ article?: string | null; name?: string | null; imageUrl?: string | null }>()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

function fullUrl(url?: string | null) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const normalized = url.startsWith('/') ? url : `/${url}`
  return `${apiBaseUrl}${normalized}`
}
</script>

<template>
  <span class="relative inline-flex items-center gap-2 group">
    <span class="font-mono text-xs text-gray-800">{{ article || '—' }}</span>

    <!-- Hover preview -->
    <span
      v-if="imageUrl"
      class="pointer-events-none absolute left-0 top-full z-20 hidden w-48 translate-y-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl group-hover:block"
    >
      <img :src="fullUrl(imageUrl)" :alt="name || article || 'product'" class="h-32 w-full rounded-lg object-cover" />
      <div class="mt-2 line-clamp-2 text-xs text-gray-700">{{ name }}</div>
    </span>
  </span>
</template>
