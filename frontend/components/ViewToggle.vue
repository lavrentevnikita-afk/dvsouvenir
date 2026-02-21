<script setup lang="ts">
import type { CatalogViewMode } from '~/composables/useCatalogViewMode'

const props = defineProps<{ modelValue: CatalogViewMode }>()

const emit = defineEmits<{ (e: 'update:modelValue', v: CatalogViewMode): void }>()

const set = (v: CatalogViewMode) => emit('update:modelValue', v)

const btnClass = (active: boolean) =>
  active
    ? 'bg-slate-900 text-white shadow-sm'
    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
</script>

<template>
  <div class="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white">
    <button
      type="button"
      class="grid h-9 w-9 place-items-center transition"
      :class="btnClass(modelValue === 'grid-lg')"
      aria-label="Большие карточки"
      title="Большие карточки"
      @click="set('grid-lg')"
    >
      <!-- 2x2 grid icon -->
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.3" />
        <rect x="13" y="4" width="7" height="7" rx="1.3" />
        <rect x="4" y="13" width="7" height="7" rx="1.3" />
        <rect x="13" y="13" width="7" height="7" rx="1.3" />
      </svg>
    </button>

    <button
      type="button"
      class="grid h-9 w-9 place-items-center transition"
      :class="btnClass(modelValue === 'grid')"
      aria-label="Средние карточки"
      title="Средние карточки"
      @click="set('grid')"
    >
      <!-- 3x3 grid icon -->
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="currentColor" aria-hidden="true">
        <rect x="4" y="4" width="4" height="4" rx="1" />
        <rect x="10" y="4" width="4" height="4" rx="1" />
        <rect x="16" y="4" width="4" height="4" rx="1" />
        <rect x="4" y="10" width="4" height="4" rx="1" />
        <rect x="10" y="10" width="4" height="4" rx="1" />
        <rect x="16" y="10" width="4" height="4" rx="1" />
        <rect x="4" y="16" width="4" height="4" rx="1" />
        <rect x="10" y="16" width="4" height="4" rx="1" />
        <rect x="16" y="16" width="4" height="4" rx="1" />
      </svg>
    </button>

    <button
      type="button"
      class="grid h-9 w-9 place-items-center transition"
      :class="btnClass(modelValue === 'list')"
      aria-label="Список"
      title="Список"
      @click="set('list')"
    >
      <!-- list icon -->
      <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M8 6h12" />
        <path d="M8 12h12" />
        <path d="M8 18h12" />
        <path d="M4 6h0" />
        <path d="M4 12h0" />
        <path d="M4 18h0" />
      </svg>
    </button>
  </div>
</template>
