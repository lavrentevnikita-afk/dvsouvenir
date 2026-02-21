<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

const route = useRoute()
const config = useRuntimeConfig()

const apiBaseUrl = process.server
  ? (config as any).apiBaseUrl
  : (config.public as any).apiBaseUrl

useHead({
  title: 'Предпросмотр товара',
  meta: [
    { name: 'robots', content: 'noindex, nofollow, noarchive' },
  ],
})

type DraftProduct = {
  id: number
  name: string
  article?: string
  description?: string
  retailPrice?: number | null
  wholesalePrice?: number | null
  isAvailable?: boolean
  images?: Array<{ id?: any; url: string; sortOrder?: number }>
  category?: { id: number; name: string; slug: string } | null
  specs?: Record<string, string> | null
}

const draft = ref<DraftProduct | null>(null)
const loadError = ref<string | null>(null)

function imageUrl(url: string) {
  const u = String(url || '')
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  return `${apiBaseUrl}${u}`
}

const images = computed(() => {
  const list = draft.value?.images || []
  const sorted = [...list].sort((a, b) => (Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)))
  return sorted.map((x) => ({ ...x, url: imageUrl(x.url) }))
})

const retailPrice = computed(() => draft.value?.retailPrice ?? null)
const wholesalePrice = computed(() => draft.value?.wholesalePrice ?? null)
const isAvailable = computed(() => !!draft.value?.isAvailable)

const specsRows = computed(() => {
  const s = draft.value?.specs || null
  const entries = s ? Object.entries(s) : []
  // hide empty
  return entries
    .filter(([_, v]) => String(v || '').trim())
    .map(([k, v]) => ({ key: k, label: k, value: String(v) }))
})

const quickSpecs = computed(() => specsRows.value.slice(0, 6))

onMounted(() => {
  if (!process.client) return
  const key = String(route.query.key || '')
  if (!key) {
    loadError.value = 'Нет ключа предпросмотра'
    return
  }
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      loadError.value = 'Черновик предпросмотра не найден (возможно, он был очищен)'
      return
    }
    const parsed = JSON.parse(raw)
    const d = parsed?.draft
    if (!d || typeof d !== 'object') {
      loadError.value = 'Черновик повреждён'
      return
    }
    draft.value = d as DraftProduct
  } catch {
    loadError.value = 'Не удалось прочитать данные предпросмотра'
  }
})
</script>

<template>
  <section class="space-y-4">
    <div class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <div class="font-semibold">Предпросмотр (не публично)</div>
      <div class="text-xs text-amber-800/80">Рендерится из текущих данных формы, даже если ты их ещё не сохранил.</div>
    </div>

    <section v-if="loadError" class="text-sm text-gray-600">
      {{ loadError }}
    </section>

    <section v-else-if="!draft" class="text-sm text-gray-600">
      Загрузка предпросмотра...
    </section>

    <section v-else class="space-y-4">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_340px] items-start">
        <!-- Client template blocks -->
        <ProductGallery :images="images" :alt="draft.name" />

        <div class="space-y-4">
          <header class="space-y-2">
            <h1 class="text-xl font-semibold leading-snug">
              {{ draft.name }}
            </h1>

            <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span v-if="draft.article">Арт: {{ draft.article }}</span>
              <span v-if="draft.category">· {{ draft.category.name }}</span>
            </div>
          </header>

          <div v-if="quickSpecs.length" class="rounded-2xl border border-gray-200 bg-white">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div class="text-sm font-semibold">Характеристики</div>
            </div>
            <div class="px-4 py-2">
              <div v-for="row in quickSpecs" :key="row.key" class="grid grid-cols-2 gap-3 py-2 text-sm border-b border-gray-100 last:border-b-0">
                <div class="text-gray-500">{{ row.label }}</div>
                <div class="text-right font-medium text-gray-900">{{ row.value }}</div>
              </div>
            </div>
          </div>
        </div>

        <aside class="lg:sticky lg:top-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
            <div class="flex items-center justify-between gap-3">
              <ProductPriceBlock
                :retail-price="retailPrice"
                :wholesale-price="wholesalePrice"
                mode="retail"
              />
              <ProductAvailabilityBadge :is-available="isAvailable" />
            </div>

            <div class="text-xs text-gray-500">
              В предпросмотре кнопки покупки скрыты.
            </div>
          </div>
        </aside>
      </div>

      <section class="rounded-2xl border border-gray-200 bg-white">
        <div class="px-4 pt-4 pb-3 border-b border-gray-100 text-sm font-semibold">Описание</div>
        <div class="p-4">
          <div class="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
            <span v-if="draft.description">{{ draft.description }}</span>
            <span v-else class="text-gray-500">Описание отсутствует</span>
          </div>
        </div>
      </section>

      <section v-if="specsRows.length" class="rounded-2xl border border-gray-200 bg-white">
        <div class="px-4 pt-4 pb-3 border-b border-gray-100 text-sm font-semibold">Характеристики</div>
        <div class="p-4">
          <dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            <div v-for="row in specsRows" :key="row.key" class="grid grid-cols-2 gap-3 px-3 py-2 text-sm">
              <dt class="text-gray-500">{{ row.label }}</dt>
              <dd class="font-medium text-gray-900 text-right">{{ row.value }}</dd>
            </div>
          </dl>
        </div>
      </section>
    </section>
  </section>
</template>
