<script setup lang="ts">
type Category = {
  id: number
  name: string
  slug: string
  imageUrl?: string | null
  productsCount?: number
  children?: Category[]
}

const props = defineProps<{ categories: Category[] }>()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiBaseUrl : config.public.apiBaseUrl

const activeSlug = ref<string | null>(props.categories?.[0]?.slug ?? null)

watch(
  () => props.categories,
  (v) => {
    if (!v || v.length === 0) {
      activeSlug.value = null
      return
    }
    if (!activeSlug.value || !v.find((c) => c.slug === activeSlug.value)) {
      activeSlug.value = v[0].slug
    }
  },
  { immediate: true },
)

const activeCategory = computed(() => {
  if (!activeSlug.value) return null
  return props.categories.find((c) => c.slug === activeSlug.value) ?? null
})

function onHoverRoot(slug: string) {
  activeSlug.value = slug
}

function imgUrl(url?: string | null) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${apiBaseUrl}${url}`
  return `${apiBaseUrl}/${url}`
}
</script>

<template>
  <section class="">
    <h2 class="text-3xl font-bold tracking-tight mb-4">
      Все категории
    </h2>

    <div class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div class="grid grid-cols-12">
        <!-- Left: root categories -->
        <aside class="col-span-12 md:col-span-4 lg:col-span-3 bg-gray-50 border-r border-gray-200">
          <ul class="p-3 space-y-1">
            <li
              v-for="c in categories"
              :key="c.slug"
              class=""
            >
              <button
                type="button"
                @mouseenter="onHoverRoot(c.slug)"
                @focus="onHoverRoot(c.slug)"
                class="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition"
                :class="activeSlug === c.slug ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-white/70'"
              >
                <span class="shrink-0 h-14 w-14 rounded-lg bg-white border border-gray-200 grid place-items-center overflow-hidden">
                  <img
                    v-if="imgUrl(c.imageUrl)"
                    :src="imgUrl(c.imageUrl)!"
                    :alt="c.name"
                    class="h-full w-full object-cover"
                    width="56" height="56"
                  />
                  <span v-else class="text-lg font-semibold text-gray-500">{{ c.name.slice(0, 1) }}</span>
                </span>

                <span class="flex-1 min-w-0">
                  <span class="block truncate text-sm font-medium text-gray-900">{{ c.name }}</span>
                  <span v-if="typeof c.productsCount === 'number'" class="block text-xs text-gray-500">
                    {{ c.productsCount }} товаров
                  </span>
                </span>

                <span class="text-gray-300">›</span>
              </button>
            </li>
          </ul>
        </aside>

        <!-- Right: subcategories -->
        <div class="col-span-12 md:col-span-8 lg:col-span-9 p-4">
          <div v-if="!activeCategory" class="text-sm text-gray-500">
            Нет категорий для показа
          </div>

          <div v-else>
            <div class="flex items-baseline justify-between mb-4">
              <div class="">
                <div class="text-lg font-semibold text-gray-900">{{ activeCategory.name }}</div>
                <div class="text-xs text-gray-500">Выберите подкатегорию</div>
              </div>
              <NuxtLink
                :to="`/catalog/${activeCategory.slug}`"
                class="text-xs font-medium text-brand hover:underline"
              >
                Открыть категорию →
              </NuxtLink>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <NuxtLink
                v-for="sc in (activeCategory.children ?? [])"
                :key="sc.slug"
                :to="`/catalog/${sc.slug}`"
                class="group"
              >
                <div class="rounded-2xl bg-gray-50 border border-gray-200 p-3 flex flex-col items-center text-center hover:bg-white hover:shadow-sm transition">
                  <div class="h-24 w-24 rounded-full bg-white border border-gray-200 overflow-hidden grid place-items-center">
                    <img
                      v-if="imgUrl(sc.imageUrl)"
                      :src="imgUrl(sc.imageUrl)!"
                      :alt="sc.name"
                      class="h-full w-full object-cover"
                      width="24" height="24"
                    />
                    <span v-else class="text-sm font-semibold text-gray-500">{{ sc.name.slice(0, 1) }}</span>
                  </div>
                  <div class="mt-3 text-xs font-medium text-gray-900 line-clamp-2">
                    {{ sc.name }}
                  </div>
                </div>
              </NuxtLink>
            </div>

            <div v-if="(activeCategory.children ?? []).length === 0" class="text-sm text-gray-500">
              У этой категории пока нет подкатегорий
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
