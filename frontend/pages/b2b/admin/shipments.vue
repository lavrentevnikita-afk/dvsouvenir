<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'b2b', middleware: ['b2b', 'staff'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

// filters
const dateFrom = ref('')
const dateTo = ref('')
const status = ref<'all' | 'ready' | 'partial' | 'shipped' | 'delivered'>('all')
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
  <div class="w-full">
    <div class="flex items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Отгрузки</h1>
        <p class="text-sm text-gray-600 mt-1">Подтверждение отправок и статусов.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="presetWeek">Неделя</button>
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">Обновить</button>
      </div>
    </div>

    <!-- Filters bar -->
    <div class="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div class="md:col-span-3">
          <div class="text-xs text-gray-500">Период (с)</div>
          <input v-model="dateFrom" type="date" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" />
        </div>
        <div class="md:col-span-3">
          <div class="text-xs text-gray-500">Период (по)</div>
          <input v-model="dateTo" type="date" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" />
        </div>
        <div class="md:col-span-3">
          <div class="text-xs text-gray-500">Статус</div>
          <select v-model="status" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white">
            <option value="all">Все</option>
            <option value="ready">Готово</option>
            <option value="partial">Частично</option>
            <option value="shipped">Отгружено</option>
            <option value="delivered">Доставлено</option>
          </select>
        </div>
        <div class="md:col-span-3">
          <div class="text-xs text-gray-500">Магазин</div>
          <select v-model="store" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white">
            <option value="all">Все</option>
            <option value="Сайт">Сайт</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="error" class="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {{ error }}
    </div>

    <!-- Table -->
    <div class="mt-4 rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <div class="text-sm font-medium">Список отгрузок</div>
        <div class="text-xs text-gray-500">{{ shipments.length }} шт.</div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left p-3">Заказ / получатель</th>
              <th class="text-left p-3">Статус</th>
              <th class="text-left p-3">План</th>
              <th class="text-left p-3">Факт</th>
              <th class="text-left p-3">Кто подтвердил</th>
              <th class="text-right p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="p-4 text-gray-500">Загрузка…</td>
            </tr>
            <tr v-else-if="!shipments.length">
              <td colspan="6" class="p-4 text-gray-500">Нет данных</td>
            </tr>
            <tr v-for="sh in shipments" :key="sh.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="p-3">
                <div class="font-medium">#{{ sh.orderId }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ sh.recipient?.name || '—' }}<span v-if="sh.recipient?.phone"> · {{ sh.recipient.phone }}</span></div>
              </td>
              <td class="p-3">
                <span class="inline-flex items-center px-2 py-1 rounded-lg border border-gray-200 text-xs">
                  {{ statusLabel[sh.status] || sh.status }}
                </span>
                <div class="text-xs text-gray-500 mt-1" v-if="sh.shippedProgress">
                  {{ sh.shippedProgress.shippedQty }}/{{ sh.shippedProgress.totalQty }}
                </div>
              </td>
              <td class="p-3">{{ humanDate(sh.plannedAt) }}</td>
              <td class="p-3">{{ humanDate(sh.shippedAt) }}</td>
              <td class="p-3">
                <div v-if="sh.confirmedBy" class="text-xs">
                  <div class="font-medium">{{ sh.confirmedBy.name || sh.confirmedBy.email }}</div>
                  <div class="text-gray-500">{{ sh.confirmedBy.email }}</div>
                </div>
                <div v-else class="text-xs text-gray-500">—</div>
              </td>
              <td class="p-3 text-right">
                <div class="inline-flex items-center gap-2">
                  <button
                    class="px-3 py-2 rounded-xl bg-amber-300 text-slate-900 text-xs font-semibold hover:brightness-95 disabled:opacity-50"
                    :disabled="sh.status === 'shipped' || sh.status === 'delivered'"
                    @click="openConfirm(sh)"
                  >
                    Подтвердить
                  </button>
                  <button
                    class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs disabled:opacity-50"
                    :disabled="sh.status === 'delivered'"
                    @click="openPartial(sh)"
                  >
                    Частично
                  </button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="openDocs(sh)">Документы</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="modalDocsOpen = false">Закрыть</button>
        </div>
      </div>
    </div>

  </div>
</template>
