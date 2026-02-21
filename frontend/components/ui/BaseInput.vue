<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        v-model="localValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @blur="emit('blur')"
      />
      
      <div v-if="error" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>

    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
// Единая система инпутов согласно DESIGN_SYSTEM.md

interface Props {
  modelValue: string | number
  type?: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: []
}>()

// Используем счетчик для стабильного ID (одинаковый на SSR и клиенте)
let idCounter = 0
const inputId = `input-${++idCounter}`

const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const inputClasses = computed(() => {
  const classes = [
    'block w-full px-4 py-2.5 text-base',
    'border rounded-lg', // 12px согласно DESIGN_SYSTEM.md
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-[#3659fa] focus:ring-offset-2',
    'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
  ]

  if (props.error) {
    classes.push('border-red-500 text-red-900 placeholder-red-300')
  } else {
    classes.push('border-gray-300 focus:border-[#3659fa]')
  }

  return classes.join(' ')
})
</script>
