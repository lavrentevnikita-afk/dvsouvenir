<script setup lang="ts">
definePageMeta({
  layout: 'admin',
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
const deleteConfirm = ref('')

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
  deleteConfirm.value = ''
}

function cancelEdit() {
  editRowId.value = null
  editDraft.value = {}
  saveConfirm.value = ''
  deleteConfirm.value = ''
}

async function deleteRow() {
  if (!dangerUnlocked.value) return
  if (!editRowId.value) return
  if (deleteConfirm.value.trim() !== 'YES_DELETE') {
    error.value = 'Для удаления введи YES_DELETE'
    return
  }
  const ok = window.confirm('Точно удалить строку? Это необратимо.')
  if (!ok) return
  loading.value = true
  error.value = ''
  try {
    await api(`/api/admin/db/table/${table.value}/${editRowId.value}`, {
      method: 'DELETE',
      body: { confirm: 'YES_DELETE' },
    })
    await loadTable()
    cancelEdit()
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Не удалось удалить'
  } finally {
    loading.value = false
  }
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
  <section class="space-y-6">
    <!-- Header -->
    <AdminPageHeader 
      title="DB Viewer" 
      description="Просмотр и (опционально) опасное редактирование таблиц. Только для admin." 
      icon="🗄️"
    />

    <!-- danger banner -->
    <div class="rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-5">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
          <span class="text-2xl">⚠️</span>
        </div>
        <div class="min-w-0">
          <div class="font-bold text-red-700 text-lg">ОПАСНО</div>
          <div class="text-sm text-red-700/80 mt-1">
            Редактирование базы может сломать магазин, заказы и авторизацию.
            По умолчанию доступен только просмотр.
          </div>
          <div class="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              v-model="dangerPhrase"
              class="w-full sm:w-64 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
              placeholder="Напиши: Я ПОНИМАЮ"
            />
            <AdminButton
              :class="confirmEnabled ? '' : 'opacity-60'"
              :disabled="!confirmEnabled"
              variant="danger"
              @click="dangerUnlocked = true"
            >
              🔓 Разблокировать редактирование
            </AdminButton>

            <AdminButton
              v-if="dangerUnlocked"
              @click="dangerUnlocked = false; cancelEdit()"
            >
              🔒 Заблокировать обратно
            </AdminButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Table selector -->
    <AdminCard>
      <div class="flex flex-col md:flex-row gap-4 md:items-end">
        <div class="w-full md:w-72">
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Таблица</label>
          <AdminSelect v-model="table" :options="tables.map(t => ({ value: t, label: t }))" />
        </div>
        <div class="w-full md:w-40">
          <label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Лимит</label>
          <AdminSelect 
            v-model="limit" 
            :options="[
              { value: 25, label: '25 строк' },
              { value: 50, label: '50 строк' },
              { value: 100, label: '100 строк' },
              { value: 200, label: '200 строк' },
            ]"
          />
        </div>

        <div class="ml-auto flex items-center gap-2">
          <AdminButton size="sm" :disabled="currentPage<=1" @click="prevPage">← Назад</AdminButton>
          <div class="text-sm text-slate-600 font-medium tabular-nums">{{ currentPage }} / {{ totalPages }}</div>
          <AdminButton size="sm" :disabled="currentPage>=totalPages" @click="nextPage">Вперёд →</AdminButton>
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
        <table class="min-w-full text-xs">
          <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th class="px-4 py-3 text-left whitespace-nowrap font-semibold">Действия</th>
              <th v-for="c in columns" :key="c" class="px-4 py-3 text-left whitespace-nowrap font-semibold">
                {{ c }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in rows"
              :key="r.id"
              class="border-t border-slate-100 align-top hover:bg-slate-50/70 transition-colors"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <template v-if="editRowId === r.id">
                  <AdminButton size="sm" @click="cancelEdit">
                    Отмена
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    class="ml-2"
                    :class="dangerUnlocked ? '' : 'opacity-50'"
                    variant="danger"
                    :disabled="!dangerUnlocked"
                    @click="saveEdit"
                  >
                    💾 Сохранить
                  </AdminButton>
                </template>
                <template v-else>
                  <AdminButton
                    size="sm"
                    :disabled="!dangerUnlocked"
                    :class="dangerUnlocked ? '' : 'opacity-50 cursor-not-allowed'"
                    @click="startEdit(r)"
                  >
                    ✏️ Редактировать
                  </AdminButton>
                </template>
              </td>

              <td v-for="c in columns" :key="c" class="px-4 py-3 whitespace-nowrap">
                <template v-if="editRowId === r.id && dangerUnlocked">
                  <input
                    v-model="editDraft[c]"
                    class="w-full min-w-[140px] rounded-lg border border-slate-200 px-2 py-1 text-sm shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"
                  />
                </template>
                <template v-else>
                  <span class="text-slate-800">{{ r[c] }}</span>
                </template>
              </td>
            </tr>

            <tr v-if="rows.length === 0">
              <td :colspan="columns.length + 1" class="px-5 py-12 text-center text-slate-500">
                <div class="text-4xl mb-2">🗄️</div>
                <div>Таблица пуста</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="p-5 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-transparent" v-if="editRowId && dangerUnlocked">
        <div class="flex flex-col lg:flex-row gap-6 lg:items-end">
          <div>
            <div class="text-xs text-slate-600">
              Чтобы сохранить изменения, введи подтверждение: <b class="text-red-600">YES_I_AM_SURE</b>
            </div>
            <input
              v-model="saveConfirm"
              class="mt-2 w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
              placeholder="YES_I_AM_SURE"
            />
          </div>

          <div>
            <div class="text-xs text-slate-600">
              Чтобы удалить строку, введи: <b class="text-red-600">YES_DELETE</b>
            </div>
            <div class="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                v-model="deleteConfirm"
                class="w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all"
                placeholder="YES_DELETE"
              />
              <AdminButton variant="danger" @click="deleteRow">
                🗑️ Удалить строку
              </AdminButton>
            </div>
          </div>
        </div>
      </div>
    </AdminCard>
  </section>
</template>
