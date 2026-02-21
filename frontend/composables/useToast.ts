type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  type: ToastType
  title?: string
  message: string
  timeoutMs?: number
}

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(input: Omit<Toast, 'id'>) {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`
    const toast: Toast = {
      id,
      timeoutMs: 2800,
      ...input,
    }
    toasts.value = [...toasts.value, toast]

    if (process.client) {
      window.setTimeout(() => remove(id), toast.timeoutMs ?? 2800)
    }

    return id
  }

  // Helper methods for common toast types
  function success(message: string, title?: string) {
    return push({ type: 'success', message, title })
  }

  function error(message: string, title?: string) {
    return push({ type: 'error', message, title })
  }

  function info(message: string, title?: string) {
    return push({ type: 'info', message, title })
  }

  return { toasts, remove, push, success, error, info }
}
