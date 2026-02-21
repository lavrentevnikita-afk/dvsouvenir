<script setup lang="ts">
type ChipKey = 'new' | 'hits' | 'inStock'
type Chip = { key: ChipKey; label: string }

const chips: Chip[] = [
  { key: 'new', label: 'Новинки' },
  { key: 'hits', label: 'Хиты' },
  { key: 'inStock', label: 'В наличии' }
]

const props = defineProps<{
  active: Partial<Record<ChipKey, boolean>>
}>()

const emit = defineEmits<{
  (e: 'toggle', key: ChipKey): void
}>()

const isActive = (key: ChipKey) => !!props.active?.[key]
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="chip in chips"
      :key="chip.key"
      type="button"
      class="rounded-full border px-3 py-1 text-xs"
      :class="
        isActive(chip.key)
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      "
      @click="emit('toggle', chip.key)"
    >
      {{ chip.label }}
    </button>
  </div>
</template>
