export default defineNuxtPlugin((nuxtApp) => {
  const send = async (payload: any) => {
    try {
      await $fetch('/api/client-errors', {
        method: 'POST',
        body: {
          ...payload,
          url: payload?.url || (process.client ? window.location.href : undefined),
          userAgent: payload?.userAgent || (process.client ? navigator.userAgent : undefined),
        },
      })
    } catch {
      // best-effort: do not break app
    }
  }

  nuxtApp.hook('app:error', (err) => {
    console.error('[app:error]', err)
    void send({
      message: (err as any)?.message || String(err),
      stack: (err as any)?.stack,
      context: { source: 'app:error' },
    })
  })

  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    console.error('[vue:error]', err, info)
    void send({
      message: (err as any)?.message || String(err),
      stack: (err as any)?.stack,
      context: { source: 'vue:error', info },
    })
  }

  if (process.client) {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[unhandledrejection]', event.reason)
      void send({
        message: (event.reason as any)?.message || String(event.reason),
        stack: (event.reason as any)?.stack,
        context: { source: 'unhandledrejection' },
      })
    })

    window.addEventListener('error', (event) => {
      console.error('[window:error]', event.error || event.message)
      void send({
        message: (event.error as any)?.message || event.message,
        stack: (event.error as any)?.stack,
        context: { source: 'window:error' },
      })
    })
  }
})
