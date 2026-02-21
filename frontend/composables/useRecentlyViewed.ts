export type RecentlyViewedItem = {
  id: number
  slug?: string | null
  name: string
  retailPrice: string
  wholesalePrice?: string | null
  imageUrl?: string | null
  categoryName?: string | null
}

const KEY = 'dvsouvenir_recently_viewed'
const MAX = 12

export function useRecentlyViewed() {
  const items = ref<RecentlyViewedItem[]>([])

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
          .filter((x) => x && typeof x.id === 'number')
          .slice(0, MAX)
      }
    } catch {
      items.value = []
    }
  }

  const persist = () => {
    if (!process.client) return
    window.localStorage.setItem(KEY, JSON.stringify(items.value.slice(0, MAX)))
  }

  const add = (item: RecentlyViewedItem) => {
    if (!process.client) return
    const next = [item, ...items.value.filter((x) => x.id !== item.id)].slice(0, MAX)
    items.value = next
    persist()
  }

  if (process.client) {
    load()
  }

  return { items, add, load }
}
