<script setup lang="ts">
import { useCityStore } from '~/stores/city'
const route = useRoute()
const router = useRouter()

const query = computed({
  get: () => (route.query.q as string) || '',
  set: (value: string) => {
    router.push({ path: '/search', query: value ? { q: value } : {} })
  }
})

const config = useRuntimeConfig()
const apiBaseUrl = process.server
  ? config.apiBaseUrl
  : config.public.apiBaseUrl

const cityStore = useCityStore()
onMounted(() => cityStore.init())

const { data, pending, error } = await useAsyncData(
  'search-results',
  () =>
    query.value
      ? $fetch('/api/catalog/search', {
          baseURL: apiBaseUrl,
          query: { query: query.value, ...(cityStore.code ? { city: cityStore.code } : {}) }
        })
      : Promise.resolve({ products: [] }),
  {
    watch: [query, () => cityStore.code]
  }
)

</script>

<template>
  <section class="space-y-4">
    <header class="space-y-2">
      <h1 class="text-xl font-semibold">Поиск по каталогу</h1>
      <p class="text-sm text-gray-600">
        Поиск по названию товара и артикулу.
      </p>

      <div class="flex gap-2">
        <input
          v-model="query"
          type="search"
          class="flex-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm"
          placeholder="Например, магнит, кружка или артикул SV-0001"
        />
      </div>
    </header>

    <div v-if="pending" class="text-sm text-gray-500">
      Идёт поиск…
    </div>

    <div v-else-if="error" class="text-sm text-red-600">
      Ошибка при выполнении поиска
    </div>

    <div v-else-if="!query" class="text-sm text-gray-500">
      Введите название или артикул товара.
    </div>

    <div
      v-else-if="data?.products?.length === 0"
      class="text-sm text-gray-500"
    >
      Ничего не найдено.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="product in data?.products"
        :key="product.id"
        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm flex items-center justify-between gap-3"
      >
        <div>
          <NuxtLink
            :to="`/product/${product.id}`"
            class="font-medium text-gray-900 hover:text-brand"
          >
            {{ product.name }}
          </NuxtLink>
          <p class="text-xs text-gray-500">
            Артикул: {{ product.article }}
          </p>
        </div>
        <p class="font-semibold whitespace-nowrap">
          {{ product.price }} ₽
        </p>
      </li>
    </ul>
  </section>
</template>
