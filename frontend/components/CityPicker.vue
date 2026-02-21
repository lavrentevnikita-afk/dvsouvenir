<script setup lang="ts">
import { useCityStore } from '~/stores/city'

const cityStore = useCityStore()

onMounted(() => {
  cityStore.init()
})

const value = computed({
  get: () => cityStore.code ?? '',
  set: (v: string) => cityStore.setCity(v || null),
})
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="hidden sm:inline text-[11px] text-gray-500">Город</span>
    <select
      v-model="value"
      class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] outline-none focus:border-slate-400"
    >
      <option value="">Все города</option>
      <option v-for="c in cityStore.cities" :key="c.code" :value="c.code">
        {{ c.name }}
      </option>
    </select>
  </div>
</template>
