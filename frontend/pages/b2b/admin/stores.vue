<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'b2b', middleware: ['staff'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const router = useRouter()
function openShop(shop: any) {
  const id = shop?.id ?? shop?.shopId ?? shop?.storeProfileId
  if (!id) return
  router.push(`/admin/stores/${id}`)
}

const status = ref<string>('')
const city = ref<string>('')
const q = ref<string>('')

const loading = ref(false)
const error = ref<string | null>(null)
const shops = ref<any[]>([])

// list page is lightweight; full shop management is on /admin/stores/:id

function buildQuery() {
  const out: any = {}
  if (status.value) out.status = status.value
  if (city.value.trim()) out.city = city.value.trim()
  if (q.value.trim()) out.q = q.value.trim()
  return out
}

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/shops', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: buildQuery(),
    })
    shops.value = Array.isArray(res?.shops) ? res.shops : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить магазины'
  } finally {
    loading.value = false
  }
}



watch([status, city], load)
onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Магазины</h1>
        <p class="text-sm text-gray-600 mt-1">Единая CRM: заявки, активные и заблокированные</p>
      </div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-600">Статус</label>
          <select v-model="status" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option value="">все</option>
            <option value="lead">lead</option>
            <option value="active">active</option>
            <option value="blocked">blocked</option>
          </select>
        </div>

        <input
          v-model="city"
          class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          placeholder="Город"
        />

        <div class="flex items-center gap-2">
          <input
            v-model="q"
            class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm w-[260px] max-w-full"
            placeholder="Поиск: название, email, телефон…"
            @keydown.enter="load"
          />
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">
            Найти
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="text-left px-4 py-3">Магазин</th>
              <th class="text-left px-4 py-3">Город</th>
              <th class="text-left px-4 py-3">Статус</th>
              <th class="text-left px-4 py-3">Скидка%</th>
              <th class="text-left px-4 py-3">Контакт</th>
              <th class="text-left px-4 py-3">Последний заказ</th>
              <th class="text-right px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in shops" :key="s.id" class="border-t border-gray-100 align-top">
              <td class="px-4 py-3">
                <div class="font-medium">{{ s.displayName || s.companyName }}</div>
                <div class="text-xs text-gray-500" v-if="s.address">{{ s.address }}</div>
                <div class="text-xs text-gray-500" v-if="s.notes">📝 {{ s.notes }}</div>
              </td>
              <td class="px-4 py-3">
                <div>{{ s.city || '—' }}</div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                  :class="
                    s.status === 'active'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : s.status === 'blocked'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  "
                >
                  {{ s.status }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm">{{ Number(s.discountPercent ?? 0) }}%</div>
              </td>
              <td class="px-4 py-3">
                <div>{{ s.user?.name || '—' }}</div>
                <div class="text-xs text-gray-500">{{ s.user?.email }}</div>
                <div class="text-xs text-gray-500" v-if="s.phone">{{ s.phone }}</div>
              </td>
              <td class="px-4 py-3">
                <div v-if="s.lastOrderAt" class="text-sm">{{ new Date(s.lastOrderAt).toLocaleString() }}</div>
                <div v-else class="text-xs text-gray-400">—</div>
                <div class="text-xs text-gray-500" v-if="s.ordersCount">Заказов: {{ s.ordersCount }}</div>
              </td>
              <td class="px-4 py-3 text-right">
                <NuxtLink
                  :to="`/b2b/admin/stores/${s.id}`"
                  class="inline-flex items-center px-3 py-2 rounded-xl bg-slate-900 text-white text-xs hover:opacity-90"
                >
                  Открыть
                </NuxtLink>
              </td>
            </tr>
            <tr v-if="shops.length === 0">
              <td colspan="7" class="px-4 py-8 text-center text-gray-500">Пусто</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    
  </section>
</template>
