<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'b2b', middleware: ['b2b', 'admin'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

type ViewMode = 'table' | 'kanban'
const viewMode = ref<ViewMode>('table')

const loading = ref(false)
const error = ref<string | null>(null)

const status = ref<'all' | 'planned' | 'in_work' | 'ready' | 'canceled'>('all')
const q = ref('')

// фильтры
const deadline = ref<'all' | 'overdue' | 'today' | 'week'>("all")
const assignee = ref('')

const tasks = ref<any[]>([])

// drawer
const drawerOpen = ref(false)
const active = ref<any | null>(null)
const deadlineLocal = ref<string>('')
const metaSaving = ref(false)
const actionLoading = ref<Record<string, boolean>>({})

const route = useRoute()

function fmtDate(dt?: string | Date | null) {
  if (!dt) return '—'
  const d = typeof dt === 'string' ? new Date(dt) : dt
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

function fmtShortDate(dt?: string | Date | null) {
  if (!dt) return '—'
  const d = typeof dt === 'string' ? new Date(dt) : dt
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

function statusLabel(s: string) {
  if (s === 'planned') return 'planned'
  if (s === 'in_work') return 'in-progress'
  if (s === 'ready') return 'done'
  if (s === 'canceled') return 'canceled'
  return s
}

function isOverdue(t: any) {
  if (!t?.deadlineAt) return false
  const d = new Date(t.deadlineAt)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  return d.getTime() < now.getTime() && t.status !== 'ready' && t.status !== 'canceled'
}

const filteredTasks = computed(() => {
  const list = Array.isArray(tasks.value) ? tasks.value : []
  const a = String(assignee.value || '').trim().toLowerCase()
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(startOfToday)
  endOfToday.setDate(endOfToday.getDate() + 1)
  const endOfWeek = new Date(startOfToday)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  return list.filter((t: any) => {
    if (a && !String(t?.assignee || '').toLowerCase().includes(a)) return false
    if (deadline.value === 'all') return true
    if (!t?.deadlineAt) return false
    const d = new Date(t.deadlineAt)
    if (Number.isNaN(d.getTime())) return false
    if (deadline.value === 'overdue') return d.getTime() < now.getTime()
    if (deadline.value === 'today') return d.getTime() >= startOfToday.getTime() && d.getTime() < endOfToday.getTime()
    if (deadline.value === 'week') return d.getTime() >= startOfToday.getTime() && d.getTime() < endOfWeek.getTime()
    return true
  })
})

const kanban = computed(() => {
  const cols: Record<string, any[]> = { planned: [], in_work: [], ready: [], canceled: [] }
  for (const t of filteredTasks.value) {
    const key = String(t?.status || 'planned')
    if (!cols[key]) cols[key] = []
    cols[key].push(t)
  }
  return cols
})

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/ops/production', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: {
        ...(status.value === 'all' ? {} : { status: status.value }),
        ...(q.value ? { q: q.value } : {}),
      },
    })
    tasks.value = Array.isArray(res?.tasks) ? res.tasks : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить производство'
  } finally {
    loading.value = false
  }
}

function openTask(t: any) {
  active.value = JSON.parse(JSON.stringify(t))
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  if (active.value?.deadlineAt) {
    const d = new Date(active.value.deadlineAt)
    if (!Number.isNaN(d.getTime())) {
      const pad = (n: number) => String(n).padStart(2, '0')
      deadlineLocal.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } else {
      deadlineLocal.value = ''
    }
  } else {
    deadlineLocal.value = ''
  }
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  active.value = null
}

async function setStatus(id: number, s: 'planned' | 'in_work' | 'ready' | 'canceled') {
  if (!auth.accessToken) return
  actionLoading.value[`status:${id}`] = true
  try {
    await $fetch<any>(`/api/ops/production/${id}/status`, {
      baseURL: apiBaseUrl,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { status: s },
    })
    await load()
  } finally {
    actionLoading.value[`status:${id}`] = false
  }
}

async function saveMeta() {
  if (!auth.accessToken || !active.value?.id) return
  metaSaving.value = true
  try {
    await $fetch<any>(`/api/ops/production/${active.value.id}/meta`, {
      baseURL: apiBaseUrl,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: {
        deadlineAt: deadlineLocal.value ? new Date(deadlineLocal.value).toISOString() : null,
        assignee: active.value.assignee || null,
      },
    })
    await load()
  } finally {
    metaSaving.value = false
  }
}

async function reserveBlanks(id: number) {
  if (!auth.accessToken) return
  actionLoading.value[`reserve:${id}`] = true
  try {
    await $fetch<any>(`/api/ops/production/${id}/reserve-blanks`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { warehouse: 'MAIN' },
    })
    await load()
  } finally {
    actionLoading.value[`reserve:${id}`] = false
  }
}

async function startTask(id: number, consume: boolean) {
  if (!auth.accessToken) return
  actionLoading.value[`start:${id}`] = true
  error.value = null
  try {
    await $fetch<any>(`/api/ops/production/${id}/start`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { warehouse: 'MAIN', consume },
    })
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось стартовать задачу'
  } finally {
    actionLoading.value[`start:${id}`] = false
  }
}

async function finishTask(id: number) {
  if (!auth.accessToken) return
  actionLoading.value[`finish:${id}`] = true
  try {
    await $fetch<any>(`/api/ops/production/${id}/finish`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { warehouse: 'MAIN' },
    })
    await load()
  } finally {
    actionLoading.value[`finish:${id}`] = false
  }
}

watch([status, q], () => load())

watch(
  () => route.query,
  (qry) => {
    const oid = String(qry?.orderId || '').trim()
    if (oid) {
      q.value = oid
    }
  },
  { immediate: true },
)

onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Производство</h1>
        <p class="text-sm text-gray-600 mt-1">Прозрачная очередь задач</p>
      </div>

      <div class="flex items-center gap-2 flex-wrap justify-end">
        <div class="inline-flex rounded-xl border border-gray-200 bg-white overflow-hidden">
          <button
            class="px-3 py-2 text-sm"
            :class="viewMode === 'table' ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'"
            @click="viewMode = 'table'"
          >
            Таблица
          </button>
          <button
            class="px-3 py-2 text-sm border-l border-gray-200"
            :class="viewMode === 'kanban' ? 'bg-gray-50 font-medium' : 'hover:bg-gray-50'"
            @click="viewMode = 'kanban'"
          >
            Канбан
          </button>
        </div>

        <input
          v-model="q"
          placeholder="поиск: заказ / артикул / название"
          class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm w-[260px]"
        />
        <select v-model="status" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
          <option value="all">Все</option>
          <option value="planned">planned</option>
          <option value="in_work">in-progress</option>
          <option value="ready">done</option>
          <option value="canceled">canceled</option>
        </select>
        <select v-model="deadline" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
          <option value="all">Дедлайн: все</option>
          <option value="overdue">Просрочено</option>
          <option value="today">Сегодня</option>
          <option value="week">Неделя</option>
        </select>
        <input
          v-model="assignee"
          placeholder="Ответственный"
          class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm w-[180px]"
        />
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">
          Обновить
        </button>
      </div>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

    <!-- TABLE -->
    <div v-else-if="viewMode === 'table'" class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="text-left px-4 py-3">Задача</th>
              <th class="text-left px-4 py-3">Заказ</th>
              <th class="text-left px-4 py-3">Что произвести</th>
              <th class="text-right px-4 py-3">Кол-во</th>
              <th class="text-left px-4 py-3">Дедлайн</th>
              <th class="text-left px-4 py-3">Заготовки</th>
              <th class="text-left px-4 py-3">Статус</th>
              <th class="text-left px-4 py-3">Ответственный</th>
              <th class="text-left px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filteredTasks" :key="t.id" class="border-t border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-3 cursor-pointer" @click="openTask(t)">
                <div class="font-medium">#{{ t.id }}</div>
                <div class="text-xs text-gray-500">создано: {{ fmtShortDate(t.createdAt) }}</div>
              </td>
              <td class="px-4 py-3 tabular-nums">#{{ t.orderId }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ t.product?.name || ('Product #' + t.productId) }}</div>
                <div class="text-xs text-gray-500">{{ t.product?.article || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-right tabular-nums">{{ t.qty }}</td>
              <td class="px-4 py-3">
                <div :class="isOverdue(t) ? 'text-rose-700 font-medium' : ''">{{ fmtShortDate(t.deadlineAt) }}</div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                  :class="t.blanksStatus === 'OK' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'"
                >
                  {{ t.blanksStatus || '—' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">
                  {{ statusLabel(t.status) }}
                </span>
              </td>
              <td class="px-4 py-3">{{ t.assignee || '—' }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-2">
                  <button
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                    :disabled="actionLoading['status:' + t.id]"
                    @click="setStatus(t.id, 'in_work')"
                  >
                    Старт
                  </button>
                  <button
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                    :disabled="actionLoading['finish:' + t.id]"
                    @click="finishTask(t.id)"
                  >
                    Готово
                  </button>
                  <button
                    class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
                    :disabled="actionLoading['status:' + t.id]"
                    @click="setStatus(t.id, 'canceled')"
                  >
                    Отменить
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredTasks.length === 0">
              <td colspan="9" class="px-4 py-8 text-center text-gray-500">Пусто</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- KANBAN -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 text-sm font-medium">planned</div>
        <div class="p-3 space-y-2">
          <button
            v-for="t in kanban.planned"
            :key="t.id"
            class="w-full text-left rounded-xl border border-gray-200 hover:bg-gray-50 px-3 py-2"
            @click="openTask(t)"
          >
            <div class="flex items-center justify-between">
              <div class="font-medium">#{{ t.id }} · #{{ t.orderId }}</div>
              <span class="text-xs" :class="t.blanksStatus === 'OK' ? 'text-emerald-700' : 'text-rose-700'">{{ t.blanksStatus }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">{{ t.product?.name || ('Product #' + t.productId) }} · {{ t.qty }} шт</div>
            <div class="text-xs mt-1" :class="isOverdue(t) ? 'text-rose-700' : 'text-gray-500'">Дедлайн: {{ fmtShortDate(t.deadlineAt) }}</div>
          </button>
          <div v-if="kanban.planned.length === 0" class="text-center text-sm text-gray-500 py-6">—</div>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 text-sm font-medium">in-progress</div>
        <div class="p-3 space-y-2">
          <button
            v-for="t in kanban.in_work"
            :key="t.id"
            class="w-full text-left rounded-xl border border-gray-200 hover:bg-gray-50 px-3 py-2"
            @click="openTask(t)"
          >
            <div class="flex items-center justify-between">
              <div class="font-medium">#{{ t.id }} · #{{ t.orderId }}</div>
              <span class="text-xs" :class="t.blanksStatus === 'OK' ? 'text-emerald-700' : 'text-rose-700'">{{ t.blanksStatus }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">{{ t.product?.name || ('Product #' + t.productId) }} · {{ t.qty }} шт</div>
            <div class="text-xs mt-1" :class="isOverdue(t) ? 'text-rose-700' : 'text-gray-500'">Дедлайн: {{ fmtShortDate(t.deadlineAt) }}</div>
          </button>
          <div v-if="kanban.in_work.length === 0" class="text-center text-sm text-gray-500 py-6">—</div>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div class="px-4 py-3 bg-gray-50 text-sm font-medium">done</div>
        <div class="p-3 space-y-2">
          <button
            v-for="t in kanban.ready"
            :key="t.id"
            class="w-full text-left rounded-xl border border-gray-200 hover:bg-gray-50 px-3 py-2"
            @click="openTask(t)"
          >
            <div class="font-medium">#{{ t.id }} · #{{ t.orderId }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ t.product?.name || ('Product #' + t.productId) }} · {{ t.qty }} шт</div>
            <div class="text-xs text-emerald-700 mt-1">На складе: {{ fmtShortDate(t.movedToStockAt) }}</div>
          </button>
          <div v-if="kanban.ready.length === 0" class="text-center text-sm text-gray-500 py-6">—</div>
        </div>
      </div>
    </div>

    <!-- Drawer -->
    <div v-if="drawerOpen" class="fixed inset-0 z-[1100]">
      <div class="absolute inset-0 bg-black/20" @click="closeDrawer" />
      <div class="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl border-l border-gray-200 flex flex-col">
        <div class="px-5 py-4 border-b border-gray-200 flex items-start justify-between gap-3">
          <div>
            <div class="text-xs text-gray-500">Задание</div>
            <div class="text-lg font-semibold">#{{ active?.id }} · Заказ #{{ active?.orderId }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ active?.product?.name || ('Product #' + active?.productId) }} · {{ active?.qty }} шт</div>
          </div>
          <button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-sm" @click="closeDrawer">✕</button>
        </div>

        <div class="p-5 space-y-6 overflow-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div class="text-xs text-gray-500">Дедлайн</div>
              <input
                v-model="deadlineLocal"
                type="datetime-local"
                class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>
            <div>
              <div class="text-xs text-gray-500">Ответственный</div>
              <input
                v-model="active.assignee"
                placeholder="ФИО/ник"
                class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <button
              class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
              :disabled="metaSaving"
              @click="saveMeta"
            >
              Сохранить
            </button>
            <span class="text-xs text-gray-500 self-center">Статус: {{ statusLabel(active?.status) }}</span>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="px-4 py-3 bg-gray-50 text-sm font-medium">Нужные заготовки</div>
            <div class="p-4">
              <div v-for="b in (active?.blanks || [])" :key="b.productId" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <div class="font-medium text-sm">{{ b.name || ('Product #' + b.productId) }}</div>
                  <div class="text-xs text-gray-500">{{ b.article || '—' }}</div>
                </div>
                <div class="text-right text-sm">
                  <div class="tabular-nums">Надо: {{ b.needQty }}</div>
                  <div class="text-xs text-gray-500 tabular-nums">Доступно: {{ b.availableQty }}</div>
                </div>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
                  :disabled="actionLoading['reserve:' + active?.id]"
                  @click="reserveBlanks(active.id)"
                >
                  Зарезервировать заготовки
                </button>
                <button
                  class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
                  :disabled="actionLoading['start:' + active?.id]"
                  @click="startTask(active.id, false)"
                >
                  Старт (только статус)
                </button>
                <button
                  class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
                  :disabled="actionLoading['start:' + active?.id]"
                  @click="startTask(active.id, true)"
                >
                  Списать заготовки при старте
                </button>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="px-4 py-3 bg-gray-50 text-sm font-medium">Завершение</div>
            <div class="p-4 space-y-3">
              <div class="text-sm text-gray-600">При завершении оприходуем готовое на основной склад (производство).</div>
              <div class="flex flex-wrap gap-2">
                <button
                  class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
                  :disabled="actionLoading['finish:' + active?.id]"
                  @click="finishTask(active.id)"
                >
                  Оприходовать готовое
                </button>
                <button
                  class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
                  :disabled="actionLoading['status:' + active?.id]"
                  @click="setStatus(active.id, 'canceled')"
                >
                  Отменить задачу
                </button>
              </div>

              <div class="text-xs text-gray-500">
                Старт: {{ fmtDate(active?.startedAt) }} · Завершено: {{ fmtDate(active?.finishedAt) }} · На складе: {{ fmtDate(active?.movedToStockAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
