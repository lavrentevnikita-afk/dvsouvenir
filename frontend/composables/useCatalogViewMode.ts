type CatalogViewMode = 'grid-lg' | 'grid' | 'list'

function normalize(v: any): CatalogViewMode | null {
  if (v === 'grid-lg' || v === 'grid' || v === 'list') return v
  return null
}

export function useCatalogViewMode() {
  const KEY = 'dvsouvenir_catalog_view'
  const route = useRoute()
  const router = useRouter()

  const mode = ref<CatalogViewMode>('grid')
  const syncing = ref(false)

  // 1) init: query -> localStorage -> default
  if (process.client) {
    const fromQuery = normalize(route.query.view)
    if (fromQuery) {
      mode.value = fromQuery
    } else {
      const saved = normalize(window.localStorage.getItem(KEY))
      if (saved) mode.value = saved
    }
  }

  // 2) keep query in sync (preserve other filters)
  watch(
    mode,
    async (v) => {
      if (!process.client) return
      try {
        window.localStorage.setItem(KEY, v)
      } catch {
        // ignore
      }

      // Avoid infinite loop between route watcher and this watcher.
      if (syncing.value) return
      syncing.value = true
      try {
        const nextQuery = { ...route.query, view: v }
        // Don't spam history: replace instead of push
        await router.replace({ query: nextQuery })
      } finally {
        syncing.value = false
      }
    },
    { flush: 'post' }
  )

  // 3) if user edits URL/query, update mode
  watch(
    () => route.query.view,
    (q) => {
      const next = normalize(q)
      if (!next) return
      if (next === mode.value) return
      syncing.value = true
      mode.value = next
      syncing.value = false
    }
  )

  return { mode }
}

export type { CatalogViewMode }