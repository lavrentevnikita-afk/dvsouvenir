<script setup lang="ts">
definePageMeta({
  layout: 'b2b',
  middleware: ['admin'],
})

import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const apiBaseUrl = computed(() => {
  const config = useRuntimeConfig()
  return process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl
})

const tables = ref<string[]>([])
const table = ref<string>('')
const rows = ref<any[]>([])
const columns = ref<string[]>([])
const limit = ref(50)
const offset = ref(0)
const count = ref(0)
const loading = ref(false)
const error = ref<string>('')

const dangerUnlocked = ref(false)
const dangerPhrase = ref('')
const confirmEnabled = computed(() => dangerPhrase.value.trim() === 'Я ПОНИМАЮ')

// редактирование
const editRowId = ref<any>(null)
const editDraft = ref<Record<string, any>>({})
const saveConfirm = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil((count.value || 0) / limit.value)))
const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)

async function api<T>(path: string, opts: any = {}) {
  if (!auth.accessToken) throw new Error('Нет токена')
  return await $fetch<T>(path, {
    baseURL: apiBaseUrl.value,
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: `Bearer ${auth.accessToken}`,
    },
  })
}

async function loadTables() {
  error.value = ''
  try {
    const res = await api<{ tables: string[] }>('/api/admin/db/tables')
    tables.value = res.tables
    if (!table.value && res.tables.length) {
      table.value = res.tables[0]
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Не удалось получить список таблиц'
  }
}

async function loadTable() {
  if (!table.value) return
  loading.value = true
  error.value = ''
  editRowId.value = null
  editDraft.value = {}
  saveConfirm.value = ''
  try {
    const res = await api<{ columns: string[]; rows: any[]; count: number; limit: number; offset: number }>(
      `/api/admin/db/table/${table.value}?limit=${limit.value}&offset=${offset.value}`,
    )
    columns.value = res.columns
    rows.value = res.rows
    count.value = res.count
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Не удалось загрузить таблицу'
  } finally {
    loading.value = false
  }
}

function startEdit(r: any) {
  editRowId.value = r.id
  editDraft.value = { ...r }
  saveConfirm.value = ''
}

function cancelEdit() {
  editRowId.value = null
  editDraft.value = {}
  saveConfirm.value = ''
}

async function saveEdit() {
  if (!dangerUnlocked.value) return
  if (!editRowId.value) return
  if (saveConfirm.value.trim() !== 'YES_I_AM_SURE') {
    error.value = 'Для сохранения введи YES_I_AM_SURE'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api(`/api/admin/db/table/${table.value}/${editRowId.value}`, {
      method: 'PATCH',
      body: {
        confirm: 'YES_I_AM_SURE',
        data: editDraft.value,
      },
    })
    await loadTable()
    cancelEdit()
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Не удалось сохранить'
  } finally {
    loading.value = false
  }
}

function prevPage() {
  offset.value = Math.max(0, offset.value - limit.value)
}
function nextPage() {
  const maxOffset = Math.max(0, (totalPages.value - 1) * limit.value)
  offset.value = Math.min(maxOffset, offset.value + limit.value)
}

watch(table, () => {
  offset.value = 0
  loadTable()
})

watch([limit, offset], () => {
  loadTable()
})

onMounted(async () => {
  await auth.fetchMe()
  await loadTables()
  await loadTable()
})
</script>

<template>
  <div>
    <h1 class="text-lg font-semibold">DB Viewer</h1>
    <p class="text-sm text-gray-500 mt-1">
      Просмотр и (опционально) опасное редактирование таблиц. Только для admin.
    </p>

    <!-- danger banner -->
    <div class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center">
          <span class="text-xl">⚠️</span>
        </div>
        <div class="min-w-0">
          <div class="font-semibold text-red-700">ОПАСНО</div>
          <div class="text-sm text-red-700/80 mt-1">
            Редактирование базы может сломать магазин, заказы и авторизацию.
            По умолчанию доступен только просмотр.
          </div>
          <div class="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              v-model="dangerPhrase"
              class="w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm"
              placeholder="Напиши: Я ПОНИМАЮ"
            />
            <button
              class="px-4 py-2 rounded-xl text-sm font-medium border"
              :class="confirmEnabled ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-700 border-red-200 opacity-60'"
              :disabled="!confirmEnabled"
              @click="dangerUnlocked = true"
            >
              Разблокировать редактирование
            </button>

            <button
              v-if="dangerUnlocked"
              class="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-700 bg-white"
              @click="dangerUnlocked = false; cancelEdit()"
            >
              Заблокировать обратно
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex flex-col md:flex-row gap-3 md:items-end">
      <div class="w-full md:w-72">
        <label class="text-xs font-medium text-gray-600">Таблица</label>
        <select v-model="table" class="w-full mt-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
          <option v-for="t in tables" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div class="w-full md:w-40">
        <label class="text-xs font-medium text-gray-600">Лимит</label>
        <select v-model.number="limit" class="w-full mt-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="200">200</option>
        </select>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <button class="px-3 py-2 rounded-xl border border-gray-200 text-sm" :disabled="currentPage<=1" @click="prevPage">←</button>
        <div class="text-sm text-gray-600">{{ currentPage }} / {{ totalPages }}</div>
        <button class="px-3 py-2 rounded-xl border border-gray-200 text-sm" :disabled="currentPage>=totalPages" @click="nextPage">→</button>
      </div>
    </div>

    <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>

    <div class="mt-4 rounded-2xl border border-gray-200 overflow-hidden">
      <div class="overflow-auto">
        <table class="min-w-full text-xs">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-3 py-2 text-left whitespace-nowrap">Действия</th>
              <th v-for="c in columns" :key="c" class="px-3 py-2 text-left whitespace-nowrap">
                {{ c }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td :colspan="columns.length + 1" class="px-3 py-4 text-gray-500">Загрузка…</td>
            </tr>

            <tr
              v-for="r in rows"
              :key="r.id"
              class="border-t border-gray-100 align-top"
            >
              <td class="px-3 py-2 whitespace-nowrap">
                <template v-if="editRowId === r.id">
                  <button
                    class="px-3 py-1 rounded-lg text-xs border border-gray-200"
                    @click="cancelEdit"
                  >
                    Отмена
                  </button>
                  <button
                    class="ml-2 px-3 py-1 rounded-lg text-xs"
                    :class="dangerUnlocked ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'"
                    :disabled="!dangerUnlocked"
                    @click="saveEdit"
                  >
                    Сохранить
                  </button>
                </template>
                <template v-else>
                  <button
                    class="px-3 py-1 rounded-lg text-xs border border-gray-200"
                    :disabled="!dangerUnlocked"
                    :class="dangerUnlocked ? '' : 'opacity-50 cursor-not-allowed'"
                    @click="startEdit(r)"
                  >
                    Редактировать
                  </button>
                </template>
              </td>

              <td v-for="c in columns" :key="c" class="px-3 py-2 whitespace-nowrap">
                <template v-if="editRowId === r.id && dangerUnlocked">
                  <input
                    v-model="editDraft[c]"
                    class="w-full min-w-[140px] rounded-lg border border-gray-200 px-2 py-1"
                  />
                </template>
                <template v-else>
                  <span class="text-gray-800">{{ r[c] }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-3 border-t border-gray-200 bg-white" v-if="editRowId && dangerUnlocked">
        <div class="text-xs text-gray-600">
          Чтобы сохранить изменения, введи подтверждение: <b>YES_I_AM_SURE</b>
        </div>
        <input
          v-model="saveConfirm"
          class="mt-2 w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm"
          placeholder="YES_I_AM_SURE"
        />
      </div>
    </div>
  </div>
</template>
