<script setup lang="ts">
const config = useRuntimeConfig()

const apiBaseUrl = process.server
  ? config.apiBaseUrl
  : config.public.apiBaseUrl

const { data, pending, error } = await useAsyncData('catalog-categories', () =>
  $fetch('/api/catalog/categories', {
    baseURL: apiBaseUrl,
  })
)

function imageUrl(url: string) {
  const u = String(url || '')
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://')) return u
  return `${apiBaseUrl}${u}`
}

function visibleChildren(children: any[]) {
  return Array.isArray(children) ? children.slice(0, 8) : []
}

function hiddenCount(children: any[]) {
  const n = Array.isArray(children) ? children.length : 0
  return Math.max(0, n - 8)
}

function fmtCount(n: any) {
  const v = Number(n || 0)
  return Number.isFinite(v) ? v : 0
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">Каталог товаров</h1>
    </header>

    <div v-if="pending" class="text-sm text-gray-500">
      Загружаем категории...
    </div>

    <div v-else-if="error" class="text-sm text-red-500">
      Не удалось загрузить категории.
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="root in data?.categories"
        :key="root.slug"
        class="overflow-hidden rounded-2xl border border-gray-200 bg-white"
      >
        <!-- header -->
        <div class="flex items-stretch justify-between gap-3 bg-gray-100">
          <div class="p-4">
            <NuxtLink
              :to="`/catalog/${root.slug}`"
              class="text-sm font-semibold text-gray-900 hover:text-slate-900"
            >
              {{ root.name }}
            </NuxtLink>
            <div v-if="root.productsCount !== undefined" class="mt-1 text-xs text-gray-500">
              Всего товаров: {{ fmtCount(root.productsCount) }}
            </div>
          </div>
          <!-- simple decorative image block (keeps layout like your пример) -->
          <div class="h-24 w-36 shrink-0 bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden">
            <img v-if="root.imageUrl" :src="imageUrl(root.imageUrl)" class="h-full w-full object-cover" />
          </div>
        </div>

        <!-- children list -->
        <div class="p-4">
          <div v-if="root.children?.length" class="space-y-1">
            <NuxtLink
              v-for="ch in visibleChildren(root.children)"
              :key="ch.slug"
              :to="`/catalog/${ch.slug}`"
              class="block text-sm text-gray-800 hover:text-slate-900"
            >
              <span class="underline decoration-gray-200 underline-offset-2 hover:decoration-slate-400">
                {{ ch.name }}
              </span>
              <span class="ml-1 text-xs text-gray-400">{{ fmtCount(ch.productsCount) }},</span>
            </NuxtLink>

            <div v-if="hiddenCount(root.children)" class="pt-1">
              <NuxtLink
                :to="`/catalog/${root.slug}`"
                class="text-sm font-semibold text-gray-900 hover:text-slate-900"
              >
                Ещё {{ hiddenCount(root.children) }} категорий ▾
              </NuxtLink>
            </div>
          </div>

          <div v-else class="text-sm text-gray-500">
            Подкатегорий пока нет.
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
