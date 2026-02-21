import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * useDebounce composable for search inputs
 */
export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue: T) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}

/**
 * useKeyboardShortcuts composable for admin panel
 */
export function useAdminKeyboardShortcuts(options: {
  onSave?: () => void
  onClose?: () => void
  onRefresh?: () => void
  onSearch?: () => void
}) {
  const handleKeydown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + S = Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      options.onSave?.()
    }
    
    // Escape = Close
    if (e.key === 'Escape') {
      options.onClose?.()
    }
    
    // Ctrl/Cmd + R = Refresh (prevent browser refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault()
      options.onRefresh?.()
    }
    
    // Ctrl+/ = Focus search (не конфликтует с браузером)
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault()
      options.onSearch?.()    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
