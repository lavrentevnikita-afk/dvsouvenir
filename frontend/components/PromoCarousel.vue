<script setup lang="ts">
type PromoBanner = {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  sortOrder: number
  isActive: boolean
}

// Грузим через абсолютный адрес backend, чтобы работало локально и в Docker.
const config = useRuntimeConfig()
const { data } = await useAsyncData('promo-banners', () => $fetch<{ banners: PromoBanner[] }>(config.public.apiBaseUrl + '/api/content/promo-banners'))

const banners = computed(() => (data.value?.banners ?? []).filter((b) => !!b.imageUrl))
const idx = ref(0)

const hasMany = computed(() => banners.value.length > 1)

function next() {
  if (!hasMany.value) return
  idx.value = (idx.value + 1) % banners.value.length
}

function prev() {
  if (!hasMany.value) return
  idx.value = (idx.value - 1 + banners.value.length) % banners.value.length
}

let timer: any
onMounted(() => {
  if (!hasMany.value) return
  timer = setInterval(() => next(), 6000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

watch(
  () => banners.value.length,
  () => {
    idx.value = 0
    if (timer) clearInterval(timer)
    if (banners.value.length > 1) timer = setInterval(() => next(), 6000)
  },
)

function openBanner(b: PromoBanner) {
  const url = String(b.linkUrl || '').trim()
  if (!url) return
  // internal links → NuxtLink-like navigation
  if (url.startsWith('/')) return navigateTo(url)
  // external
  window.open(url, '_blank', 'noopener,noreferrer')
}

function imgUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // Локальные пути раздаём через Nuxt proxy: /uploads/** -> backend
  // В БД может оказаться как "/uploads/..." так и "uploads/..." — нормализуем.
  return url.startsWith('/') ? url : `/${url}`
}

const prevIndex = computed(() => {
  if (!banners.value.length) return 0
  return (idx.value - 1 + banners.value.length) % banners.value.length
})
const nextIndex = computed(() => {
  if (!banners.value.length) return 0
  return (idx.value + 1) % banners.value.length
})

function posClass(i: number) {
  // 3-слайдовый вид как на рефе: центр + уменьшенные соседние
  if (i === idx.value) return 'is-active'
  if (i === prevIndex.value) return 'is-prev'
  if (i === nextIndex.value) return 'is-next'
  return 'is-hidden'
}
</script>

<template>
  <!--
    Большой контейнер под подхэддером.
    Соседние слайды видны частично и «утопают» во фейде.
  -->
  <section v-if="banners.length" class="w-full px-4 pt-3 pb-4">
    <div class="mx-auto w-full max-w-[1440px]">
      <div class="relative rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm">
      <!-- viewport (как на рефе: центр + уменьшенные соседи) -->
      <div class="relative overflow-hidden rounded-3xl">
        <!-- фиксированная высота, чтобы блок занимал полосу как на рефе -->
        <div class="promo-viewport h-[170px] sm:h-[220px]">
          <div
            v-for="(b, i) in banners"
            :key="b.id"
            class="promo-slide"
            :class="posClass(i)"
          >
            <button
              type="button"
              class="block h-full w-full"
              :class="b.linkUrl ? 'cursor-pointer' : 'cursor-default'"
              @click="openBanner(b)"
            >
              <img
                :src="imgUrl(b.imageUrl)"
                :alt="b.title || 'Промо'"
                class="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          </div>

          <!-- лёгкая виньетка по краям, чтобы подслайды "утопали" как на скрине -->
          <div class="pointer-events-none absolute inset-0">
            <!-- затемнение по краям + лёгкая «шторка», как на рефе -->
            <div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
            <div class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/60 via-black/25 to-transparent" />
          </div>
        </div>
      </div>

      <!-- arrows -->
      <!-- arrows (как на скрине: серый круг, внутри стрелка) -->
      <button
        v-if="hasMany"
        type="button"
        class="promo-arrow left"
        aria-label="Назад"
        @click="prev"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        v-if="hasMany"
        type="button"
        class="promo-arrow right"
        aria-label="Вперёд"
        @click="next"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <!-- dots -->
      <div v-if="hasMany" class="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
        <button
          v-for="(_, i) in banners"
          :key="i"
          type="button"
          class="h-2 w-2 rounded-full"
          :class="i === idx ? 'bg-white' : 'bg-white/50 hover:bg-white/70'"
          :aria-label="`Слайд ${i + 1}`"
          @click="idx = i"
        />
      </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.promo-viewport {
  position: relative;
}

.promo-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 56px;
  width: 56px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.35);
  color: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  transition: background 180ms ease, transform 180ms ease;
}
.promo-arrow:hover {
  background: rgba(255, 255, 255, 0.5);
}
.promo-arrow:active {
  transform: translateY(-50%) scale(0.98);
}
.promo-arrow.left {
  left: 14px;
}
.promo-arrow.right {
  right: 14px;
}

.promo-slide {
  position: absolute;
  inset: 0;
  transform-origin: center;
  transition: transform 450ms ease, opacity 450ms ease, filter 450ms ease;
  border-radius: 1.5rem;
  overflow: hidden;
}

.promo-slide.is-active {
  z-index: 30;
  opacity: 1;
  transform: translateX(0%) scale(1);
  filter: none;
}

.promo-slide.is-prev {
  z-index: 20;
  opacity: 0.35;
  transform: translateX(-56%) scale(0.88);
  filter: blur(0.2px);
}

.promo-slide.is-next {
  z-index: 20;
  opacity: 0.35;
  transform: translateX(56%) scale(0.88);
  filter: blur(0.2px);
}

.promo-slide.is-hidden {
  z-index: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(0%) scale(0.8);
}

@media (max-width: 640px) {
  .promo-slide.is-prev {
    transform: translateX(-62%) scale(0.86);
  }
  .promo-slide.is-next {
    transform: translateX(62%) scale(0.86);
  }
}
</style>
