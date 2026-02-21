<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: ['staff'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

// filters
const priority = ref<string>('all')
const deadline = ref<string>('all')
const assignee = ref<string>('')

// data
const loading = ref(false)
const error = ref<string | null>(null)
const orders = ref<any[]>([])
const openRow = ref<Record<number, boolean>>({})
const busy = ref<Record<string, boolean>>({}) // key: `${orderId}:${productId}` or action

function toggleRow(id: number) {
  openRow.value = { ...openRow.value, [id]: !openRow.value[id] }
}

function humanDateShort(dt: any) {
  if (!dt) return '—'
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0, 5)
}

function deadlineBadge(dt: any) {
  if (!dt) return { text: '—', cls: 'bg-gray-100 text-gray-700 border-gray-200' }
  const d = new Date(dt)
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (d < startToday) return { text: 'Просрочено', cls: 'bg-red-50 text-red-700 border-red-200' }
  const endToday = new Date(startToday.getTime() + 24 * 60 * 60 * 1000 - 1)
  if (d <= endToday) return { text: 'Сегодня', cls: 'bg-amber-50 text-amber-800 border-amber-200' }
  return { text: 'В срок', cls: 'bg-green-50 text-green-700 border-green-200' }
}

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/ops/in-work', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: {
        priority: priority.value === 'all' ? undefined : priority.value,
        deadline: deadline.value === 'all' ? undefined : deadline.value,
        assignee: assignee.value?.trim() ? assignee.value.trim() : undefined,
        warehouse: 'FINISHED',
      },
    })
    orders.value = Array.isArray(res?.orders) ? res.orders : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить список'
  } finally {
    loading.value = false
  }
}

async function setMeta(id: number, patch: any) {
  if (!auth.accessToken) return
  const key = `meta:${id}`
  if (busy.value[key]) return
  busy.value = { ...busy.value, [key]: true }
  try {
    await $fetch(`/api/ops/in-work/${id}/meta`, {
      baseURL: apiBaseUrl,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: patch,
    })
    await load()
  } finally {
    const next = { ...busy.value }
    delete next[key]
    busy.value = next
  }
}

async function toggleItem(orderId: number, productId: number, checked: boolean) {
  if (!auth.accessToken) return
  const key = `${orderId}:${productId}`
  if (busy.value[key]) return
  busy.value = { ...busy.value, [key]: true }
  try {
    await $fetch(`/api/ops/in-work/${orderId}/check`, {
      baseURL: apiBaseUrl,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { productId, checked },
    })
    // локально обновим, чтобы не дергать полный reload на каждый чек
    const idx = orders.value.findIndex((o) => o.id === orderId)
    if (idx >= 0) {
      const o = { ...orders.value[idx] }
      const lines = (o.lines || []).map((l: any) => (l.productId === productId ? { ...l, checked } : l))
      o.lines = lines
      o.allChecked = lines.length ? lines.every((l: any) => l.checked) : false
      o.allStockOk = lines.length ? lines.every((l: any) => l.stockOk) : false
      orders.value.splice(idx, 1, o)
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось обновить чек-лист'
  } finally {
    const next = { ...busy.value }
    delete next[key]
    busy.value = next
  }
}

async function readyToShip(orderId: number) {
  if (!auth.accessToken) return
  const key = `ready:${orderId}`
  if (busy.value[key]) return
  busy.value = { ...busy.value, [key]: true }
  try {
    await $fetch(`/api/ops/in-work/${orderId}/ready`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { warehouse: 'FINISHED' },
    })
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось отметить готовность к отгрузке'
  } finally {
    const next = { ...busy.value }
    delete next[key]
    busy.value = next
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <AdminPageHeader 
      title="В работе" 
      description="Сборка/комплектация: что сейчас собираем и что уже можно отдавать в отгрузку" 
      icon="📦"
    >
      <template #actions>
        <AdminButton @click="load">Обновить</AdminButton>
      </template>
    </AdminPageHeader>

    <!-- Filters -->
    <AdminCard>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Приоритет</label>
          <AdminSelect 
            v-model="priority" 
            :options="[
              { value: 'all', label: 'Любой' },
              { value: '1', label: '1 — высокий' },
              { value: '2', label: '2 — средний' },
              { value: '3', label: '3 — обычный' },
            ]"
          />
        </div>

        <div>
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Дедлайн</label>
          <AdminSelect 
            v-model="deadline" 
            :options="[
              { value: 'all', label: 'Любой' },
              { value: 'overdue', label: 'Просроченные' },
              { value: 'today', label: 'Сегодня' },
              { value: 'week', label: 'Ближайшие 7 дней' },
              { value: 'none', label: 'Без дедлайна' },
            ]"
          />
        </div>

        <div>
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Ответственный</label>
          <AdminInput v-model="assignee" placeholder="Имя/логин" icon="search" />
        </div>

        <div class="flex items-end gap-2">
          <AdminButton @click="load">Применить</AdminButton>
          <AdminButton 
            variant="ghost"
            @click="priority='all'; deadline='all'; assignee=''; load()"
          >
            Сброс
          </AdminButton>
        </div>
      </div>
    </AdminCard>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
      <span>❌</span>
      {{ error }}
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex items-center gap-3 text-slate-500">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span>Загрузка…</span>
      </div>
    </div>

    <AdminCard v-else :padding="false">
      <div class="overflow-auto">
        <table class="min-w-[1100px] w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr class="text-left">
              <th class="px-5 py-3.5 font-semibold">Заказ</th>
              <th class="px-5 py-3.5 font-semibold">Что нужно собрать</th>
              <th class="px-5 py-3.5 font-semibold">Наличие по складу</th>
              <th class="px-5 py-3.5 font-semibold">Чек-лист сборки</th>
              <th class="px-5 py-3.5 font-semibold text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="o in orders" :key="o.id">
              <tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                <td class="px-4 py-3 align-top">
                  <div class="flex items-start gap-3">
                    <button
                      class="mt-0.5 w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                      @click="toggleRow(o.id)"
                      :aria-label="openRow[o.id] ? 'Свернуть' : 'Развернуть'"
                    >
                      {{ openRow[o.id] ? '–' : '+' }}
                    </button>
                    <div>
                      <div class="font-semibold">#{{ o.id }}</div>
                      <div class="text-xs text-gray-500">{{ o.customerName }} · {{ o.totalPrice }} ₽</div>
                      <div class="text-xs text-gray-500 mt-1">Создан: {{ humanDateShort(o.createdAt) }}</div>

                      <div class="flex flex-wrap items-center gap-2 mt-2">
                        <span class="text-[11px] px-2 py-1 rounded-full border" :class="deadlineBadge(o.deadlineAt).cls">
                          {{ deadlineBadge(o.deadlineAt).text }}
                        </span>

                        <span v-if="o.priority" class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700">
                          Приоритет: {{ o.priority }}
                        </span>

                        <span v-if="o.assignee" class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700">
                          {{ o.assignee }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="space-y-1">
                    <div v-for="l in (o.lines || []).slice(0, 3)" :key="l.productId" class="text-xs">
                      <span class="font-medium">{{ l.name || ('#' + l.productId) }}</span>
                      <span class="text-gray-500"> — {{ l.quantity }} шт.</span>
                    </div>
                    <div v-if="(o.lines || []).length > 3" class="text-xs text-gray-500">и ещё {{ (o.lines || []).length - 3 }}…</div>
                    <div v-if="(o.lines || []).length === 0" class="text-xs text-gray-500">—</div>
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="space-y-1">
                    <div v-for="l in (o.lines || []).slice(0, 3)" :key="l.productId" class="text-xs">
                      <span class="text-gray-700">{{ l.stock.available }} / {{ l.quantity }}</span>
                      <span
                        class="ml-2 text-[11px] px-2 py-0.5 rounded-full border"
                        :class="l.stockOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
                      >
                        {{ l.stockOk ? 'OK' : 'Дефицит' }}
                      </span>
                    </div>
                    <div v-if="(o.lines || []).length > 3" class="text-xs text-gray-500">…</div>
                    <div v-if="(o.lines || []).length === 0" class="text-xs text-gray-500">—</div>
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="text-xs">
                    <span class="font-semibold tabular-nums">{{ (o.lines || []).filter((l:any)=>l.checked).length }}</span>
                    <span class="text-gray-500"> / {{ (o.lines || []).length }} собр.</span>
                  </div>
                  <div class="text-[11px] mt-1" :class="o.allChecked ? 'text-green-700' : 'text-gray-500'">
                    {{ o.allChecked ? 'Чек-лист закрыт' : 'Нужно отметить позиции' }}
                  </div>
                </td>

                <td class="px-4 py-3 align-top">
                  <div class="flex justify-end gap-2">
                    <NuxtLink
                      :to="`/admin/orders?q=${o.id}`"
                      class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
                    >
                      Открыть
                    </NuxtLink>
                    <button
                      class="px-3 py-2 rounded-xl text-xs"
                      :class="(o.allChecked && o.allStockOk) ? 'border border-green-200 bg-green-50 text-green-800 hover:bg-green-100' : 'border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'"
                      :disabled="!(o.allChecked && o.allStockOk) || busy[`ready:${o.id}`]"
                      @click="readyToShip(o.id)"
                    >
                      Готово к отгрузке
                    </button>
                  </div>
                </td>
              </tr>

              <!-- expanded row -->
              <tr v-if="openRow[o.id]" class="border-t border-gray-100 bg-white">
                <td class="px-4 py-4" colspan="5">
                  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div class="lg:col-span-2">
                      <div class="text-xs font-semibold text-gray-700 mb-2">Чек-лист сборки</div>
                      <div class="rounded-2xl border border-gray-200 overflow-hidden">
                        <div v-for="l in (o.lines || [])" :key="l.productId" class="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 first:border-t-0">
                          <label class="flex items-start gap-3 min-w-0">
                            <input
                              type="checkbox"
                              class="mt-1"
                              :checked="l.checked"
                              :disabled="busy[`${o.id}:${l.productId}`]"
                              @change="toggleItem(o.id, l.productId, ($event.target as HTMLInputElement).checked)"
                            />
                            <div class="min-w-0">
                              <div class="text-sm font-medium truncate">{{ l.name || ('#' + l.productId) }}</div>
                              <div class="text-xs text-gray-500">ID: {{ l.productId }} · Нужно: {{ l.quantity }} шт.</div>
                            </div>
                          </label>

                          <div class="text-right">
                            <div class="text-sm tabular-nums">{{ l.stock.available }} / {{ l.quantity }}</div>
                            <div class="text-[11px] mt-1">
                              <span
                                class="px-2 py-0.5 rounded-full border"
                                :class="l.stockOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'"
                              >
                                {{ l.stockOk ? 'На складе OK' : 'Дефицит' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div v-if="(o.lines || []).length === 0" class="px-4 py-3 text-sm text-gray-500">Позиции не найдены</div>
                      </div>
                    </div>

                    <div>
                      <div class="text-xs font-semibold text-gray-700 mb-2">Параметры задачи</div>
                      <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                        <div>
                          <div class="text-[11px] font-semibold text-gray-700 mb-1">Приоритет</div>
                          <select
                            class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                            :value="o.priority || ''"
                            @change="setMeta(o.id, { priority: ($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null })"
                          >
                            <option value="">—</option>
                            <option value="1">1 — высокий</option>
                            <option value="2">2 — средний</option>
                            <option value="3">3 — обычный</option>
                          </select>
                        </div>

                        <div>
                          <div class="text-[11px] font-semibold text-gray-700 mb-1">Дедлайн</div>
                          <input
                            type="datetime-local"
                            class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                            :value="o.deadlineAt ? new Date(o.deadlineAt).toISOString().slice(0,16) : ''"
                            @change="setMeta(o.id, { deadlineAt: ($event.target as HTMLInputElement).value ? new Date(($event.target as HTMLInputElement).value).toISOString() : null })"
                          />
                        </div>

                        <div>
                          <div class="text-[11px] font-semibold text-gray-700 mb-1">Ответственный</div>
                          <input
                            class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"
                            :value="o.assignee || ''"
                            placeholder="Например: Никита"
                            @change="setMeta(o.id, { assignee: ($event.target as HTMLInputElement).value || null })"
                          />
                        </div>

                        <div class="pt-1">
                          <button
                            class="w-full px-3 py-2 rounded-xl text-sm"
                            :class="(o.allChecked && o.allStockOk) ? 'border border-green-200 bg-green-50 text-green-800 hover:bg-green-100' : 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'"
                            :disabled="!(o.allChecked && o.allStockOk) || busy[`ready:${o.id}`]"
                            @click="readyToShip(o.id)"
                          >
                            Готово к отгрузке
                          </button>
                          <p class="text-[11px] text-gray-500 mt-2">
                            Кнопка активна, когда всё собрано и на складе хватает товара.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <tr v-if="orders.length === 0">
              <td colspan="5" class="px-5 py-12 text-center text-slate-500">
                <div class="text-4xl mb-2">📦</div>
                <div>Пока нет заказов «В работе»</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminCard>
  </section>
</template>
