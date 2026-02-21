<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const error = ref<string | null>(null)

const status = ref<'all' | 'planned' | 'in_progress' | 'done' | 'blocked'>('all')
const q = ref('')

const workOrders = ref<any[]>([])
const actionLoading = ref<Record<string, boolean>>({})
const produceQty = ref<Record<number, number>>({})
const defectQty = ref<Record<number, number>>({})

function statusLabel(s: string) {
  if (s === 'planned') return 'planned'
  if (s === 'in_progress') return 'in-progress'
  if (s === 'done') return 'done'
  if (s === 'blocked') return 'blocked'
  return s
}

function progress(wo: any) {
  const planned = Number(wo?.qtyPlanned || 0)
  const done = Number(wo?.qtyDone || 0)
  const defect = Number(wo?.qtyDefect || 0)
  if (!planned) return 0
  return Math.max(0, Math.min(100, Math.round(((done + defect) / planned) * 100)))
}

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/production', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: {
        ...(status.value === 'all' ? {} : { status: status.value }),
        ...(q.value ? { q: q.value } : {}),
      },
    })
    workOrders.value = Array.isArray(res?.workOrders) ? res.workOrders : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить производство'
  } finally {
    loading.value = false
  }
}

async function start(woId: number) {
  if (!auth.accessToken) return
  actionLoading.value[`start:${woId}`] = true
  error.value = null
  try {
    await $fetch(`/api/admin/production/${woId}/start`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось перевести WO в работу'
  } finally {
    actionLoading.value[`start:${woId}`] = false
  }
}

async function complete(woId: number) {
  if (!auth.accessToken) return
  const qty = Number(produceQty.value[woId] || 0)
  if (!qty) return
  actionLoading.value[`complete:${woId}`] = true
  error.value = null
  try {
    await $fetch(`/api/admin/production/${woId}/complete`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { qty },
    })
    produceQty.value[woId] = 0
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось выпустить'
  } finally {
    actionLoading.value[`complete:${woId}`] = false
  }
}

async function toDefect(woId: number) {
  if (!auth.accessToken) return
  const qty = Number(defectQty.value[woId] || 0)
  if (!qty) return
  actionLoading.value[`defect:${woId}`] = true
  error.value = null
  try {
    await $fetch(`/api/admin/production/${woId}/defect`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { qty },
    })
    defectQty.value[woId] = 0
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось списать в брак'
  } finally {
    actionLoading.value[`defect:${woId}`] = false
  }
}

onMounted(() => {
  load()
})
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <AdminPageHeader 
      title="Производство" 
      description="Work Orders → выпуск на FINISHED" 
      icon="🏭"
    >
      <template #actions>
        <AdminButton @click="load">
          Обновить
        </AdminButton>
      </template>
    </AdminPageHeader>

    <!-- Filters -->
    <AdminCard>
      <div class="flex flex-wrap items-center gap-3">
        <AdminSelect 
          v-model="status" 
          :options="[
            { value: 'all', label: 'Все статусы' },
            { value: 'planned', label: 'Запланировано' },
            { value: 'in_progress', label: 'В работе' },
            { value: 'done', label: 'Готово' },
            { value: 'blocked', label: 'Заблокировано' },
          ]"
          @update:modelValue="load"
        />
        <AdminInput
          v-model="q"
          icon="search"
          placeholder="Поиск (заказ / товар)"
          class="w-full sm:w-[280px]"
          @keyup.enter="load"
        />
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

    <AdminCard v-else :padding="false" title="Work Orders">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th class="text-left px-5 py-3.5 font-semibold">WO #</th>
              <th class="text-left px-5 py-3.5 font-semibold">Заказ</th>
              <th class="text-left px-5 py-3.5 font-semibold">Товар</th>
              <th class="text-left px-5 py-3.5 font-semibold">Статус</th>
              <th class="text-left px-5 py-3.5 font-semibold">Прогресс</th>
              <th class="text-left px-5 py-3.5 font-semibold">Выпуск</th>
              <th class="text-left px-5 py-3.5 font-semibold">Брак</th>
              <th class="text-right px-5 py-3.5 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="wo in workOrders" :key="wo.id" class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
              <td class="px-5 py-4 font-bold text-slate-900">#{{ wo.id }}</td>
              <td class="px-5 py-4 text-slate-600">#{{ wo.orderId }}</td>
              <td class="px-5 py-4">
                <div class="font-semibold text-slate-900">{{ wo.product?.name || ('Товар #' + wo.productId) }}</div>
              </td>
              <td class="px-5 py-4">
                <AdminStatusBadge 
                  :status="wo.status" 
                  :map="{
                    planned: { label: '📅 Запланировано', color: 'blue' },
                    in_progress: { label: '⚙️ В работе', color: 'amber' },
                    done: { label: '✅ Готово', color: 'green' },
                    blocked: { label: '🚫 Заблокировано', color: 'red' },
                  }"
                />
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-[120px] h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      class="h-2 rounded-full transition-all duration-300" 
                      :class="progress(wo) >= 100 ? 'bg-emerald-500' : progress(wo) >= 50 ? 'bg-amber-500' : 'bg-slate-400'"
                      :style="{ width: progress(wo) + '%' }" 
                    />
                  </div>
                  <div class="text-xs tabular-nums text-slate-600">
                    <span class="font-semibold text-slate-900">{{ wo.qtyDone }}</span> / {{ wo.qtyPlanned }}
                    <span v-if="Number(wo.qtyDefect || 0) > 0" class="text-red-500 ml-1">· брак {{ wo.qtyDefect }}</span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4">
                <input
                  v-model.number="produceQty[wo.id]"
                  type="number"
                  min="0"
                  step="1"
                  class="px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-sm w-[100px] focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"
                  placeholder="кол-во"
                />
              </td>
              <td class="px-5 py-4">
                <input
                  v-model.number="defectQty[wo.id]"
                  type="number"
                  min="0"
                  step="1"
                  class="px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-sm w-[100px] focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"
                  placeholder="кол-во"
                />
              </td>
              <td class="px-5 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <AdminButton
                    size="sm"
                    :loading="actionLoading['start:' + wo.id]"
                    @click="start(wo.id)"
                  >
                    ▶️ В работу
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="primary"
                    :loading="actionLoading['complete:' + wo.id]"
                    @click="complete(wo.id)"
                  >
                    ✅ Выпустить
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    variant="danger"
                    :loading="actionLoading['defect:' + wo.id]"
                    @click="toDefect(wo.id)"
                  >
                    ❌ В брак
                  </AdminButton>
                </div>
              </td>
            </tr>

            <tr v-if="workOrders.length === 0">
              <td colspan="8" class="px-5 py-12 text-center text-slate-500">
                <div class="text-4xl mb-2">🏭</div>
                <div>Пока нет Work Orders</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminCard>
  </section>
</template>
