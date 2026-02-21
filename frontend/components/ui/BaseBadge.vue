<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
// Единая система бейджей для статусов согласно DESIGN_SYSTEM.md

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
type Size = 'sm' | 'md'

interface Props {
  variant?: Variant
  size?: Size
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
})

const badgeClasses = computed(() => {
  const classes = [
    'inline-flex items-center font-medium rounded-full',
  ]

  // Size variants
  if (props.size === 'sm') {
    classes.push('px-2 py-0.5 text-xs')
  } else {
    classes.push('px-3 py-1 text-sm')
  }

  // Color variants (используем цвета из DESIGN_SYSTEM.md)
  if (props.variant === 'success') {
    classes.push('bg-green-100 text-green-800')
  } else if (props.variant === 'warning') {
    classes.push('bg-[#ffc700]/20 text-[#ff9500]') // Accent colors
  } else if (props.variant === 'danger') {
    classes.push('bg-red-100 text-red-800')
  } else if (props.variant === 'info') {
    classes.push('bg-[#a4b4ff]/20 text-[#3659fa]') // Primary colors
  } else if (props.variant === 'neutral') {
    classes.push('bg-gray-100 text-gray-800')
  }

  return classes.join(' ')
})
</script>
