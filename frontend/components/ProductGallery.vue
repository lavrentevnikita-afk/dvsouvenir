<script setup lang="ts">
type Img = { url: string; id?: number | string }

const props = defineProps<{ images: Img[]; alt: string }>()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

function normalize(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const normalized = url.startsWith('/') ? url : `/${url}`
  return `${apiBaseUrl}${normalized}`
}

const active = ref(0)
const isOpen = ref(false)
const zoomed = ref(false)

const list = computed(() => (Array.isArray(props.images) ? props.images : []).map((i) => ({ ...i, url: normalize(String(i.url || '')) })))

const mainUrl = computed(() => {
  if (!list.value.length) return null
  return list.value[active.value]?.url ?? list.value[0]?.url ?? null
})

// "Scrub" style image switcher: move cursor across the image to change photo.
const hoverSegs = computed(() => {
  const len = list.value?.length ?? 0
  return Math.min(len, 5)
})

const activeSeg = computed(() => {
  const len = list.value?.length ?? 0
  const segs = hoverSegs.value
  if (len <= 1 || segs <= 1) return 0
  return Math.min(segs - 1, Math.floor((active.value / (len - 1)) * segs))
})

function setActiveByPointer(e: MouseEvent | TouchEvent) {
  const len = list.value?.length ?? 0
  const segs = hoverSegs.value
  if (len <= 1 || segs <= 1) return

  const el = e.currentTarget as HTMLElement | null
  if (!el) return
  const rect = el.getBoundingClientRect()
  const clientX = (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX
  const x = Math.max(0, Math.min(rect.width, clientX - rect.left))
  const seg = Math.min(segs - 1, Math.floor((x / rect.width) * segs))
  const idx = Math.min(len - 1, Math.round((seg / (segs - 1)) * (len - 1)))
  select(idx)
}

function select(index: number) {
  if (index < 0 || index >= list.value.length) return
  active.value = index
  zoomed.value = false
}

function open() {
  if (!mainUrl.value) return
  isOpen.value = true
  zoomed.value = false
}

function close() {
  isOpen.value = false
  zoomed.value = false
}

function prev() {
  if (!list.value.length) return
  const nextIndex = (active.value - 1 + list.value.length) % list.value.length
  select(nextIndex)
}

function next() {
  if (!list.value.length) return
  const nextIndex = (active.value + 1) % list.value.length
  select(nextIndex)
}

// IMPORTANT:
// We do NOT generate / serve AVIF/WebP derivatives on the backend.
// Using <picture><source> with derived .avif/.webp URLs makes modern browsers
// pick a non-existing file and show a broken image (no fallback).
// So we always render the original URL.

const onKey = (e: KeyboardEvent) => {
  if (!isOpen.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

watch(isOpen, (v) => {
  if (!process.client) return
  document.documentElement.style.overflow = v ? 'hidden' : ''
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  if (!process.client) return
  document.documentElement.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="space-y-4">
    <button
      type="button"
      class="group relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-white flex items-center justify-center"
      @mousemove="setActiveByPointer"
      @touchmove.passive="setActiveByPointer"
      @click="open"
    >
      <template v-if="mainUrl">
        <img
          :src="mainUrl"
          :alt="alt"
          class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <span
          class="pointer-events-none absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[10px] text-gray-600 shadow"
        >
          Нажмите для zoom
        </span>

        <!-- Scrub bars (like marketplace): hover to switch photos. No arrows. -->
        <div v-if="list.length > 1" class="pointer-events-none absolute left-2 right-2 top-2 flex gap-1">
          <span
            v-for="n in hoverSegs"
            :key="n"
            class="h-1 flex-1 rounded-full"
            :class="(n - 1) === activeSeg ? 'bg-slate-900/80' : 'bg-white/70'"
          />
        </div>
      </template>
      <div v-else class="text-xs text-gray-400">Нет изображения</div>
    </button>

    <div v-if="list.length > 1" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="(image, index) in list"
        :key="image.id || index"
        type="button"
        class="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border"
        :class="index === active ? 'border-slate-900' : 'border-gray-200 hover:border-gray-300'"
        @click="select(index)"
      >
        <img :src="image.url" :alt="alt" class="h-full w-full object-cover" loading="lazy" />
      </button>
    </div>

    <!-- Modal zoom -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="close"
      >
        <div class="relative w-full max-w-4xl">
          <button
            type="button"
            class="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800"
            @click="close"
          >
            Закрыть
          </button>

          <!-- No arrow buttons in modal: use thumbnails or keyboard arrows -->

          <div class="overflow-hidden rounded-2xl bg-white shadow-xl">
            <button
              type="button"
              class="block w-full bg-white"
              @click="zoomed = !zoomed"
              :title="zoomed ? 'Уменьшить' : 'Увеличить'"
            >
              <img
                v-if="mainUrl"
                :src="mainUrl"
                :alt="alt"
                class="h-[70vh] w-full object-contain transition-transform duration-200"
                :class="zoomed ? 'scale-[1.7] cursor-zoom-out' : 'scale-100 cursor-zoom-in'"
              />
            </button>
            <div class="flex items-center justify-between px-4 py-3 text-xs text-gray-600">
              <span>Клик по изображению: {{ zoomed ? 'уменьшить' : 'увеличить' }}</span>
              <span v-if="list.length">{{ active + 1 }} / {{ list.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
