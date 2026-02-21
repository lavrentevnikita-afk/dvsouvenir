<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const auth = useAuthStore()
auth.initFromStorage()
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const tab = ref<'users' | 'dicts' | 'system' | 'logs' | 'integrations'>('users')
const loading = ref(false)
const error = ref<string | null>(null)

const users = ref<any[]>([])
const reasons = ref<any[]>([])
const logs = ref<any[]>([])

// System: main warehouses
const systemLoading = ref(false)
const systemWarehouses = ref<any[]>([])
const mainWarehouses = ref<{ blanksWarehouseId: number | null; finishedWarehouseId: number | null; defectWarehouseId: number | null }>({
  blanksWarehouseId: null,
  finishedWarehouseId: null,
  defectWarehouseId: null,
})

async function loadMainWarehouses() {
  if (!auth.accessToken) return
  systemLoading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/settings/main-warehouses', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    const mw = res?.mainWarehouses || res || {}
    mainWarehouses.value = {
      blanksWarehouseId: mw?.blanksWarehouseId ? Number(mw.blanksWarehouseId) : null,
      finishedWarehouseId: mw?.finishedWarehouseId ? Number(mw.finishedWarehouseId) : null,
      defectWarehouseId: mw?.defectWarehouseId ? Number(mw.defectWarehouseId) : null,
    }
    systemWarehouses.value = Array.isArray(res?.warehouses) ? res.warehouses : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить системные настройки'
  } finally {
    systemLoading.value = false
  }
}

async function saveMainWarehouses() {
  if (!auth.accessToken) return
  try {
    await $fetch('/api/admin/settings/main-warehouses', {
      method: 'PUT',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { ...mainWarehouses.value },
    })
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить системные настройки'
  }
}

const roleEdit = ref<{ id: number; role: string } | null>(null)

async function loadUsers() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/settings/users', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    users.value = Array.isArray(res?.users) ? res.users : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить пользователей'
  } finally {
    loading.value = false
  }
}

async function setRole(u: any, role: string) {
  if (!auth.accessToken) return
  try {
    await $fetch(`/api/admin/settings/users/${u.id}/role`, {
      method: 'PATCH',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { role },
    })
    await loadUsers()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось изменить роль'
  }
}

async function loadReasons() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/settings/dicts/issue-reasons', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    reasons.value = Array.isArray(res?.reasons) ? res.reasons : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить справочник'
  } finally {
    loading.value = false
  }
}

async function saveReasons() {
  if (!auth.accessToken) return
  try {
    await $fetch('/api/admin/settings/dicts/issue-reasons', {
      method: 'PUT',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { reasons: reasons.value },
    })
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить'
  }
}

async function loadLogs() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/settings/audit', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      query: { limit: 200 },
    })
    logs.value = Array.isArray(res?.logs) ? res.logs : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить логи'
  } finally {
    loading.value = false
  }
}

watch(tab, async () => {
  if (tab.value === 'users') return loadUsers()
  if (tab.value === 'dicts') return loadReasons()
  if (tab.value === 'system') return loadMainWarehouses()
  if (tab.value === 'logs') return loadLogs()
})

onMounted(loadUsers)
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <AdminPageHeader 
      title="Настройки" 
      description="Пользователи, роли, справочники, системные настройки" 
      icon="⚙️"
    />

    <!-- Tab Pills -->
    <div class="bg-slate-100 p-1 rounded-xl inline-flex gap-1">
      <button
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="tab==='users' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        @click="tab='users'"
      >
        Пользователи
      </button>
      <button
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="tab==='dicts' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        @click="tab='dicts'"
      >
        Справочники
      </button>
      <button
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="tab==='system' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        @click="tab='system'"
      >
        Система
      </button>
      <button
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="tab==='logs' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        @click="tab='logs'"
      >
        Логи
      </button>
      <button
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="tab==='integrations' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        @click="tab='integrations'"
      >
        Интеграции
      </button>
    </div>

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

    <!-- Users -->
    <AdminCard v-if="tab==='users' && !loading" :padding="false" title="👥 Пользователи и роли">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th class="text-left px-5 py-3.5 font-semibold">ID</th>
              <th class="text-left px-5 py-3.5 font-semibold">Имя</th>
              <th class="text-left px-5 py-3.5 font-semibold">Email</th>
              <th class="text-left px-5 py-3.5 font-semibold">Роль</th>
              <th class="text-right px-5 py-3.5 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
              <td class="px-5 py-4 font-medium text-slate-700">{{ u.id }}</td>
              <td class="px-5 py-4 font-semibold text-slate-900">{{ u.name }}</td>
              <td class="px-5 py-4 text-slate-600">{{ u.email }}</td>
              <td class="px-5 py-4">
                <AdminSelect
                  class="w-[180px]"
                  :modelValue="u.role"
                  :options="[
                    { value: 'admin', label: 'Администратор', icon: '👑' },
                    { value: 'manager', label: 'Менеджер', icon: '💼' },
                    { value: 'warehouse', label: 'Склад', icon: '📦' },
                    { value: 'production', label: 'Производство', icon: '🏭' },
                    { value: 'store', label: 'Магазин', icon: '🏪' },
                    { value: 'customer', label: 'Клиент', icon: '🛒' },
                  ]"
                  @update:modelValue="(val) => setRole(u, val)"
                />
              </td>
              <td class="px-5 py-4 text-right text-xs text-slate-400">—</td>
            </tr>
            <tr v-if="users.length===0">
              <td colspan="5" class="px-5 py-12 text-center text-slate-500">
                <div class="text-4xl mb-2">👥</div>
                <div>Нет пользователей</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminCard>

    <!-- Dicts -->
    <div v-if="tab==='dicts'" class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <div class="flex items-center justify-between gap-2">
        <div>
          <div class="text-sm font-medium">Причины списаний</div>
          <div class="text-xs text-gray-500">Используются в “-списание” на складе</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="reasons.push({code:'new', label:'новая причина'})">+ добавить</button>
          <button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90" @click="saveReasons">Сохранить</button>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="text-left px-4 py-3">code</th>
              <th class="text-left px-4 py-3">label</th>
              <th class="text-right px-4 py-3">—</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r,i) in reasons" :key="i" class="border-t border-gray-100">
              <td class="px-4 py-3"><input v-model="r.code" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></td>
              <td class="px-4 py-3"><input v-model="r.label" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" /></td>
              <td class="px-4 py-3 text-right">
                <button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs" @click="reasons.splice(i,1)">Удалить</button>
              </td>
            </tr>
            <tr v-if="reasons.length===0"><td colspan="3" class="px-4 py-8 text-center text-gray-500">Пусто</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- System -->
    <div v-if="tab==='system'" class="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
      <div class="flex items-center justify-between gap-2">
        <div>
          <div class="text-sm font-medium">Основные склады</div>
          <div class="text-xs text-gray-500">Фундамент: BLANKS (заготовки), FINISHED (готовая продукция), опционально DEFECT</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="loadMainWarehouses">Обновить</button>
          <button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90" @click="saveMainWarehouses">Сохранить</button>
        </div>
      </div>

      <div v-if="systemLoading" class="text-sm text-gray-500">Загрузка…</div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="space-y-1">
          <div class="text-xs text-gray-500">BLANKS</div>
          <select v-model.number="mainWarehouses.blanksWarehouseId" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option :value="null">—</option>
            <option v-for="w in systemWarehouses" :key="w.id" :value="Number(w.id)">{{ w.code }} — {{ w.name }}</option>
          </select>
        </div>
        <div class="space-y-1">
          <div class="text-xs text-gray-500">FINISHED</div>
          <select v-model.number="mainWarehouses.finishedWarehouseId" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option :value="null">—</option>
            <option v-for="w in systemWarehouses" :key="w.id" :value="Number(w.id)">{{ w.code }} — {{ w.name }}</option>
          </select>
        </div>
        <div class="space-y-1">
          <div class="text-xs text-gray-500">DEFECT (опционально)</div>
          <select v-model.number="mainWarehouses.defectWarehouseId" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
            <option :value="null">—</option>
            <option v-for="w in systemWarehouses" :key="w.id" :value="Number(w.id)">{{ w.code }} — {{ w.name }}</option>
          </select>
        </div>
      </div>

      <div class="text-xs text-gray-500">
        Эти id будут использоваться дальше для правил: отгрузка только из FINISHED, производство по рецепту (BOM), резервы только с привязкой к заказу.
      </div>
    </div>

    <!-- Logs -->
    <div v-if="tab==='logs'" class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="text-left px-4 py-3">Дата/время</th>
              <th class="text-left px-4 py-3">Action</th>
              <th class="text-left px-4 py-3">Entity</th>
              <th class="text-left px-4 py-3">UserId</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in logs" :key="l.id" class="border-t border-gray-100">
              <td class="px-4 py-3 text-xs text-gray-600">{{ new Date(l.createdAt).toLocaleString() }}</td>
              <td class="px-4 py-3">{{ l.action }}</td>
              <td class="px-4 py-3 text-xs text-gray-600">{{ l.entity || '—' }}</td>
              <td class="px-4 py-3 text-xs text-gray-600">{{ l.userId || '—' }}</td>
            </tr>
            <tr v-if="logs.length===0"><td colspan="4" class="px-4 py-8 text-center text-gray-500">Пусто</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Integrations -->
    <div v-if="tab==='integrations'" class="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
      <div class="text-sm font-medium">Интеграции</div>
      <div class="text-sm text-gray-600">Пока заглушка: сюда можно добавить статусы подключений (CRM).</div>
      <div class="text-xs text-gray-500">Если нужно — я сделаю UI под конкретные интеграции и health-check эндпоинты.</div>
    </div>
  </section>
</template>
