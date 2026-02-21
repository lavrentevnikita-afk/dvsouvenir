<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :to="to"
    :type="!to ? type : undefined"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
    <slot />
  </component>
</template>

<script setup lang="ts">
// Единая кнопочная система согласно DESIGN_SYSTEM.md
// Использует Electric Indigo (#3659fa) как primary цвет

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  to?: string
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const buttonClasses = computed(() => {
  const classes = [
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ]

  // Size variants (согласно DESIGN_SYSTEM.md)
  if (props.size === 'sm') {
    classes.push('px-3 py-1.5 text-sm rounded-lg') // rounded-lg = 12px
  } else if (props.size === 'md') {
    classes.push('px-4 py-2 text-base rounded-lg')
  } else if (props.size === 'lg') {
    classes.push('px-6 py-3 text-lg rounded-xl') // rounded-xl = 24px
  }

  // Color variants (используем цвета из DESIGN_SYSTEM.md)
  if (props.variant === 'primary') {
    // Electric Indigo (#3659fa)
    classes.push('bg-[#3659fa] text-white hover:bg-[#2847d9] focus:ring-[#3659fa]')
  } else if (props.variant === 'secondary') {
    // Lavender Blue (#a4b4ff)
    classes.push('bg-[#a4b4ff] text-[#1a1a1a] hover:bg-[#8a9aef] focus:ring-[#a4b4ff]')
  } else if (props.variant === 'success') {
    classes.push('bg-green-600 text-white hover:bg-green-700 focus:ring-green-500')
  } else if (props.variant === 'danger') {
    classes.push('bg-red-600 text-white hover:bg-red-700 focus:ring-red-500')
  } else if (props.variant === 'outline') {
    classes.push('border-2 border-[#3659fa] text-[#3659fa] hover:bg-[#3659fa] hover:text-white focus:ring-[#3659fa]')
  } else if (props.variant === 'ghost') {
    classes.push('text-[#3659fa] hover:bg-[#a4b4ff]/20 focus:ring-[#a4b4ff]')
  }

  if (props.fullWidth) {
    classes.push('w-full')
  }

  return classes.join(' ')
})
</script>
