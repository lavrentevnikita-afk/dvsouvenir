export type RecentlyViewedCategory = {
  slug: string
  name?: string | null
  ts: number
}

const KEY = 'dvsouvenir_recent_categories'
const MAX = 8

export function useRecentlyViewedCategories() {
  const items = ref<RecentlyViewedCategory[]>([])

  const load = () => {
    if (!process.client) return
    try {
      const raw = window.localStorage.getItem(KEY)
      if (!raw) {
        items.value = []
        return
      }
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        items.value = parsed
          .filter((x) => x && typeof x.slug === 'string')
          .slice(0, MAX)
      } else {
        items.value = []
      }
    } catch {
      items.value = []
    }
  }

  const persist = () => {
    if (!process.client) return
    window.localStorage.setItem(KEY, JSON.stringify(items.value.slice(0, MAX)))
  }

  const add = (slug: string, name?: string | null) => {
    if (!process.client) return
    const clean = String(slug || '').trim()
    if (!clean) return
    const now = Date.now()
    const next: RecentlyViewedCategory[] = [
      { slug: clean, name: name ?? null, ts: now },
      ...items.value.filter((x) => x.slug !== clean),
    ].slice(0, MAX)
    items.value = next
    persist()
  }

  if (process.client) {
    load()
  }

  return { items, add, load }
}
