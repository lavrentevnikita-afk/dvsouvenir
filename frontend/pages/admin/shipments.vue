<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: ['staff'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

// filters
const dateFrom = ref('')
const dateTo = ref('')
// Этап 5: по умолчанию показываем только полностью готовые к отгрузке
const status = ref<'all' | 'ready' | 'partial' | 'shipped' | 'delivered'>('ready')
const store = ref<'all' | string>('all')

const loading = ref(false)
const error = ref<string | null>(null)
const shipments = ref<any[]>([])

const statusLabel: Record<string, string> = {
  ready: 'Готово',
  partial: 'Частично',
  shipped: 'Отгружено',
  delivered: 'Доставлено',
  created: 'Готово',
}

function humanDate(dt: any) {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleString()
}

function presetWeek() {
  const now = new Date()
  const from = new Date(now)
  from.setDate(now.getDate() - 6)
  dateFrom.value = from.toISOString().slice(0, 10)
  dateTo.value = now.toISOString().slice(0, 10)
}

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/ops/shipments', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: {
        status: status.value === 'all' ? undefined : status.value,
        store: store.value === 'all' ? undefined : store.value,
        dateFrom: dateFrom.value ? new Date(dateFrom.value).toISOString() : undefined,
        dateTo: dateTo.value ? new Date(dateTo.value + 'T23:59:59.999Z').toISOString() : undefined,
      },
    })
    shipments.value = Array.isArray(res?.shipments) ? res.shipments : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить отгрузки'
  } finally {
    loading.value = false
  }
}

watch([dateFrom, dateTo, status, store], () => load())
onMounted(() => {
  presetWeek()
  load()
})

// modals
const modalConfirmOpen = ref(false)
const modalPartialOpen = ref(false)
const modalDocsOpen = ref(false)
const active = ref<any | null>(null)
const orderDetail = ref<any | null>(null)

const confirmShipped = ref(true)
const confirmDateTime = ref('')
const confirmWaybill = ref('')
const confirmComment = ref('')
const confirmFile = ref<File | null>(null)
const confirmUploading = ref(false)

const partialItems = ref<Record<number, number>>({})
const partialWaybill = ref('')
const partialComment = ref('')
const partialDateTime = ref('')
const partialFile = ref<File | null>(null)
const partialUploading = ref(false)

function resetConfirm() {
  confirmShipped.value = true
  confirmDateTime.value = new Date().toISOString().slice(0, 16)
  confirmWaybill.value = ''
  confirmComment.value = ''
  confirmFile.value = null
}

function resetPartial() {
  partialItems.value = {}
  partialDateTime.value = new Date().toISOString().slice(0, 16)
  partialWaybill.value = ''
  partialComment.value = ''
  partialFile.value = null
}

async function openConfirm(row: any) {
  active.value = row
  resetConfirm()
  modalConfirmOpen.value = true
}

async function openDocs(row: any) {
  active.value = row
  modalDocsOpen.value = true
}

async function fetchOrderDetail(orderId: number) {
  if (!auth.accessToken) return null
  return $fetch<any>(`/api/ops/orders/${orderId}`, {
    baseURL: apiBaseUrl,
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  })
}

async function openPartial(row: any) {
  active.value = row
  resetPartial()
  modalPartialOpen.value = true
  try {
    orderDetail.value = await fetchOrderDetail(Number(row.orderId))
    const shippedItems = (row.shippedItems || {}) as Record<string, number>
    const next: Record<number, number> = {}
    for (const it of (orderDetail.value?.order?.items || orderDetail.value?.items || row?.items || []) as any[]) {
      const pid = Number(it.productId)
      const need = Number(it.quantity || 0)
      const already = Number(shippedItems[String(pid)] || 0)
      const remaining = Math.max(0, need - already)
      if (remaining > 0) next[pid] = 0
    }
    partialItems.value = next
  } catch {
    // ignore; user can still enter quantities
  }
}

async function uploadShipmentPhoto(file: File) {
  if (!auth.accessToken) throw new Error('No token')
  const fd = new FormData()
  fd.append('file', file)
  const res = await $fetch<any>('/api/admin/media/upload', {
    baseURL: apiBaseUrl,
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.accessToken}` },
    query: { folder: 'shipments' },
    body: fd,
  })
  return res?.url as string
}

async function submitConfirm() {
  if (!active.value) return
  if (!confirmShipped.value) {
    modalConfirmOpen.value = false
    return
  }
  confirmUploading.value = true
  try {
    let photoUrl: string | undefined
    if (confirmFile.value && auth.user?.role === 'admin') {
      photoUrl = await uploadShipmentPhoto(confirmFile.value)
    }
    await $fetch<any>(`/api/ops/shipments/${active.value.id}/confirm`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: {
        shippedAt: confirmDateTime.value ? new Date(confirmDateTime.value).toISOString() : undefined,
        waybillNumber: confirmWaybill.value || undefined,
        comment: confirmComment.value || undefined,
        photoUrl,
      },
    })
    modalConfirmOpen.value = false
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось подтвердить отгрузку'
  } finally {
    confirmUploading.value = false
  }
}

async function submitPartial() {
  if (!active.value) return
  partialUploading.value = true
  try {
    let photoUrl: string | undefined
    if (partialFile.value && auth.user?.role === 'admin') {
      photoUrl = await uploadShipmentPhoto(partialFile.value)
    }

    const items = Object.entries(partialItems.value)
      .map(([pid, qty]) => ({ productId: Number(pid), qty: Number(qty || 0) }))
      .filter((x) => x.productId && x.qty > 0)

    await $fetch<any>(`/api/ops/shipments/${active.value.id}/partial`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: {
        shippedAt: partialDateTime.value ? new Date(partialDateTime.value).toISOString() : undefined,
        waybillNumber: partialWaybill.value || undefined,
        comment: partialComment.value || undefined,
        photoUrl,
        items,
      },
    })
    modalPartialOpen.value = false
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось выполнить частичную отгрузку'
  } finally {
    partialUploading.value = false
  }
}

</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <AdminPageHeader 
      title="Отгрузки" 
      description="Подтверждение отправок и статусов" 
      icon="🚚"
    >
      <template #actions>
        <AdminButton @click="presetWeek">Неделя</AdminButton>
        <AdminButton @click="load">Обновить</AdminButton>
      </template>
    </AdminPageHeader>

    <!-- Filters bar -->
    <AdminCard>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Период (с)</label>
          <AdminInput v-model="dateFrom" type="date" icon="calendar" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Период (по)</label>
          <AdminInput v-model="dateTo" type="date" icon="calendar" />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Статус</label>
          <AdminSelect 
            v-model="status" 
            :options="[
              { value: 'all', label: 'Все статусы' },
              { value: 'ready', label: 'Готово' },
              { value: 'partial', label: 'Частично' },
              { value: 'shipped', label: 'Отгружено' },
              { value: 'delivered', label: 'Доставлено' },
            ]"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Магазин</label>
          <AdminSelect 
            v-model="store" 
            :options="[
              { value: 'all', label: 'Все магазины' },
              { value: 'Сайт', label: 'Сайт' },
            ]"
          />
        </div>
      </div>
    </AdminCard>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
      <span>❌</span>
      {{ error }}
    </div>

    <!-- Table -->
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
      <div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent flex items-center justify-between">
        <div class="font-bold text-slate-800">Список отгрузок</div>
        <div class="text-xs text-slate-500">{{ shipments.length }} записей</div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th class="text-left px-5 py-3.5 font-semibold">Заказ / получатель</th>
              <th class="text-left px-5 py-3.5 font-semibold">Статус</th>
              <th class="text-left px-5 py-3.5 font-semibold">План</th>
              <th class="text-left px-5 py-3.5 font-semibold">Факт</th>
              <th class="text-left px-5 py-3.5 font-semibold">Кто подтвердил</th>
              <th class="text-right px-5 py-3.5 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!shipments.length">
              <td colspan="6" class="px-5 py-12 text-center text-slate-500">
                <div class="text-4xl mb-2">🚚</div>
                <div>Нет данных</div>
              </td>
            </tr>
            <tr v-for="sh in shipments" :key="sh.id" class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
              <td class="px-5 py-4">
                <div class="font-bold text-slate-900">#{{ sh.orderId }}</div>
                <div class="text-xs text-slate-500 mt-0.5">{{ sh.recipient?.name || '—' }}<span v-if="sh.recipient?.phone"> · {{ sh.recipient.phone }}</span></div>
              </td>
              <td class="px-5 py-4">
                <AdminStatusBadge 
                  :status="sh.status" 
                  :map="{
                    ready: { label: '✅ Готово', color: 'green' },
                    partial: { label: '📦 Частично', color: 'amber' },
                    shipped: { label: '🚚 Отгружено', color: 'blue' },
                    delivered: { label: '🎉 Доставлено', color: 'purple' },
                    created: { label: '📋 Создано', color: 'slate' },
                  }" 
                />
                <div class="text-xs text-slate-500 mt-1" v-if="sh.shippedProgress">
                  {{ sh.shippedProgress.shippedQty }}/{{ sh.shippedProgress.totalQty }}
                </div>
              </td>
              <td class="px-5 py-4 text-slate-700">{{ humanDate(sh.plannedAt) }}</td>
              <td class="px-5 py-4 text-slate-700">{{ humanDate(sh.shippedAt) }}</td>
              <td class="px-5 py-4">
                <div v-if="sh.confirmedBy" class="text-xs">
                  <div class="font-medium text-slate-900">{{ sh.confirmedBy.name || sh.confirmedBy.email }}</div>
                  <div class="text-slate-500">{{ sh.confirmedBy.email }}</div>
                </div>
                <div v-else class="text-xs text-slate-400">—</div>
              </td>
              <td class="px-5 py-4 text-right">
                <div class="inline-flex items-center gap-2">
                  <AdminButton
                    size="sm"
                    variant="primary"
                    :disabled="sh.status === 'shipped' || sh.status === 'delivered'"
                    @click="openConfirm(sh)"
                  >
                    ✅ Подтвердить
                  </AdminButton>
                  <AdminButton size="sm" @click="openDocs(sh)">📄 Документы</AdminButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminCard>

    <!-- Confirm modal -->
    <div v-if="modalConfirmOpen" class="fixed inset-0 z-[1100] bg-black/40 flex items-center justify-center p-4">
      <div class="w-full max-w-xl rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <div class="font-semibold">Подтверждение отгрузки #{{ active?.orderId }}</div>
          <button class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100" @click="modalConfirmOpen = false">✕</button>
        </div>
        <div class="p-4 space-y-3">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="confirmShipped" />
            <span>Отгружено</span>
          </label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div class="text-xs text-gray-500">Дата/время</div>
              <input v-model="confirmDateTime" type="datetime-local" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" />
            </div>
            <div>
              <div class="text-xs text-gray-500">Номер накладной</div>
              <input v-model="confirmWaybill" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="Напр. 123-XYZ" />
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">Комментарий</div>
            <textarea v-model="confirmComment" rows="3" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="Комментарий / детали отправки" />
          </div>

          <div>
            <div class="text-xs text-gray-500">Фото/скан (опционально)</div>
            <input type="file" accept="image/*" class="mt-1 w-full" :disabled="auth.user?.role !== 'admin'" @change="(e:any) => (confirmFile = e.target.files?.[0] || null)" />
            <div v-if="auth.user?.role !== 'admin'" class="text-xs text-gray-500 mt-1">Загрузка доступна только админу.</div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="modalConfirmOpen = false">Отмена</button>
          <button class="px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95 disabled:opacity-50" :disabled="confirmUploading" @click="submitConfirm">
            {{ confirmUploading ? 'Сохраняю…' : 'Подтвердить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Partial modal -->
    <div v-if="modalPartialOpen" class="fixed inset-0 z-[1100] bg-black/40 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <div class="font-semibold">Частичная отгрузка #{{ active?.orderId }}</div>
          <button class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100" @click="modalPartialOpen = false">✕</button>
        </div>
        <div class="p-4 space-y-3">
          <div class="text-xs text-gray-500">Отметь только то, что реально отгружаешь сейчас. Остаток останется “в работе”.</div>

          <div class="rounded-2xl border border-gray-200 overflow-hidden">
            <table class="min-w-full text-sm">
              <thead class="text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left p-3">Позиция</th>
                  <th class="text-right p-3">Отгрузить</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(qty, pid) in partialItems" :key="pid" class="border-b border-gray-100">
                  <td class="p-3">
                    <div class="font-medium">
                      <div class="flex flex-col gap-1">
                        <div class="text-sm text-gray-900">
                          {{ (orderDetail?.lines || []).find((x:any)=>String(x.productId)===String(pid))?.name || '—' }}
                        </div>
                        <ProductLabel
                          :article="(orderDetail?.lines || []).find((x:any)=>String(x.productId)===String(pid))?.article"
                          :name="(orderDetail?.lines || []).find((x:any)=>String(x.productId)===String(pid))?.name"
                          :imageUrl="(orderDetail?.lines || []).find((x:any)=>String(x.productId)===String(pid))?.previewImageUrl"
                        />
                      </div>
                    </div>
                  </td>
                  <td class="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      v-model.number="partialItems[Number(pid)]"
                      class="w-28 px-3 py-2 rounded-xl border border-gray-200 text-right"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div class="text-xs text-gray-500">Дата/время</div>
              <input v-model="partialDateTime" type="datetime-local" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" />
            </div>
            <div>
              <div class="text-xs text-gray-500">Номер накладной</div>
              <input v-model="partialWaybill" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="Напр. 123-XYZ" />
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500">Комментарий</div>
            <textarea v-model="partialComment" rows="3" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="Комментарий / детали отправки" />
          </div>

          <div>
            <div class="text-xs text-gray-500">Фото/скан (опционально)</div>
            <input type="file" accept="image/*" class="mt-1 w-full" :disabled="auth.user?.role !== 'admin'" @change="(e:any) => (partialFile = e.target.files?.[0] || null)" />
            <div v-if="auth.user?.role !== 'admin'" class="text-xs text-gray-500 mt-1">Загрузка доступна только админу.</div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="modalPartialOpen = false">Отмена</button>
          <button class="px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95 disabled:opacity-50" :disabled="partialUploading" @click="submitPartial">
            {{ partialUploading ? 'Сохраняю…' : 'Отгрузить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Docs modal -->
    <div v-if="modalDocsOpen" class="fixed inset-0 z-[1100] bg-black/40 flex items-center justify-center p-4">
      <div class="w-full max-w-xl rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <div class="font-semibold">Документы #{{ active?.orderId }}</div>
          <button class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100" @click="modalDocsOpen = false">✕</button>
        </div>
        <div class="p-4 space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <div class="text-gray-500">Накладная</div>
            <div class="font-medium">{{ active?.waybillNumber || '—' }}</div>
          </div>
          <div class="flex items-start justify-between gap-3">
            <div class="text-gray-500">Комментарий</div>
            <div class="text-right">{{ active?.comment || '—' }}</div>
          </div>
          <div class="pt-2">
            <div class="text-xs text-gray-500">Фото/скан</div>
            <div v-if="active?.photoUrl" class="mt-2">
              <a :href="active.photoUrl" target="_blank" class="text-amber-700 hover:underline">Открыть</a>
              <img :src="active.photoUrl" class="mt-2 rounded-2xl border border-gray-200 max-h-[320px] object-contain" />
            </div>
            <div v-else class="text-sm text-gray-500 mt-1">—</div>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex items-center justify-end">
          <AdminButton @click="modalDocsOpen = false">Закрыть</AdminButton>
        </div>
      </div>
    </div>

  </section>
</template>
