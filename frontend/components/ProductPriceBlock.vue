<script setup lang="ts">
const props = defineProps<{
  retailPrice: string | number
  wholesalePrice?: string | number | null
  compact?: boolean
}>()

const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const format = (v: number | null) => (v == null || !Number.isFinite(v) ? '—' : `${nf.format(Math.round(v))}\u202F₽`)

const basePrice = computed(() => {
  const wholesale = props.wholesalePrice == null ? null : Number(props.wholesalePrice)
  if (wholesale != null && Number.isFinite(wholesale) && wholesale > 0) return wholesale

  const retail = Number(props.retailPrice)
  if (Number.isFinite(retail) && retail > 0) return retail
  return null
})
</script>

<template>
  <div class="space-y-0.5" :class="compact ? 'text-xs' : ''">
    <div class="flex items-center gap-2">
      <p class="font-semibold text-gray-900" :class="compact ? 'text-base' : 'text-lg'">{{ format(basePrice) }}</p>
      <span class="text-xs font-semibold text-gray-600">Опт</span>
    </div>
  </div>
</template>
