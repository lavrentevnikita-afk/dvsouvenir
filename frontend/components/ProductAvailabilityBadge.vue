<script setup lang="ts">

type AvailabilityStatus = 'preorder' | 'in_stock' | 'expected'

// Backward compatible:
// - old: { isAvailable, hint }
// - new: { status, canOrder }

const props = defineProps<{
  status?: AvailabilityStatus | null
  canOrder?: boolean | null
  isAvailable?: boolean
  hint?: string | null
  finishedQty?: number | null
}>()


const level = computed((): AvailabilityStatus | 'low' | 'many' => {
  if (props.status) return props.status
  const raw = (props.hint ?? '').toLowerCase().trim()
  if (raw.includes('под заказ') || raw.includes('заказ')) return 'preorder'
  if (raw.includes('мало') || raw.includes('few')) return 'low'
  if (raw.includes('много') || raw.includes('many')) return 'many'
  return props.isAvailable ? 'many' : 'preorder'
})

const text = computed(() => {
  if (level.value === 'preorder') return 'Под заказ'
  if (level.value === 'in_stock') {
    if (props.finishedQty && props.finishedQty > 0) return `В наличии: ${props.finishedQty} шт.`
    return 'В наличии'
  }
  if (level.value === 'expected') return 'Ожидаем поступления'
  if (level.value === 'low') return 'Мало'
  return 'Много'
})

const klass = computed(() => {
  if (level.value === 'preorder') return 'bg-gray-100 text-gray-600'
  if (level.value === 'in_stock') return 'bg-emerald-100 text-emerald-800'
  if (level.value === 'expected') return 'bg-gray-200 text-gray-500'
  if (level.value === 'low') return 'bg-amber-100 text-amber-800'
  return 'bg-emerald-100 text-emerald-800'
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
    :class="klass"
  >
    <span class="mr-1">{{ level === 'preorder' ? '○' : '●' }}</span>
    {{ text }}
  </span>
</template>
