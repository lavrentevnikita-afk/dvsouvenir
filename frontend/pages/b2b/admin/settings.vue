<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'b2b', middleware: ['b2b', 'staff'] })

const auth = useAuthStore()
auth.initFromStorage()
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const tab = ref<'users' | 'dicts' | 'logs' | 'integrations'>('users')
const loading = ref(false)
const error = ref<string | null>(null)

const users = ref<any[]>([])
const reasons = ref<any[]>([])
const logs = ref<any[]>([])

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
  if (tab.value === 'logs') return loadLogs()
})

onMounted(loadUsers)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Настройки</h1>
        <p class="text-sm text-gray-600 mt-1">Минимум, но полезно: роли, справочники, логи</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
          :class="tab==='users' ? 'bg-gray-100' : ''"
          @click="tab='users'"
        >
          Пользователи и роли
        </button>
        <button
          class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
          :class="tab==='dicts' ? 'bg-gray-100' : ''"
          @click="tab='dicts'"
        >
          Справочники
        </button>
        <button
          class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
          :class="tab==='logs' ? 'bg-gray-100' : ''"
          @click="tab='logs'"
        >
          Логи
        </button>
        <button
          class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
          :class="tab==='integrations' ? 'bg-gray-100' : ''"
          @click="tab='integrations'"
        >
          Интеграции
        </button>
      </div>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

    <!-- Users -->
    <div v-if="tab==='users'" class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="text-left px-4 py-3">ID</th>
              <th class="text-left px-4 py-3">Имя</th>
              <th class="text-left px-4 py-3">Email</th>
              <th class="text-left px-4 py-3">Роль</th>
              <th class="text-right px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="border-t border-gray-100">
              <td class="px-4 py-3">{{ u.id }}</td>
              <td class="px-4 py-3">{{ u.name }}</td>
              <td class="px-4 py-3">{{ u.email }}</td>
              <td class="px-4 py-3">
                <select
                  class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                  :value="u.role"
                  @change="setRole(u, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="warehouse">warehouse</option>
                  <option value="production">production</option>
                  <option value="store">store</option>
                  <option value="customer">customer</option>
                </select>
              </td>
              <td class="px-4 py-3 text-right text-xs text-gray-500">—</td>
            </tr>
            <tr v-if="users.length===0"><td colspan="5" class="px-4 py-8 text-center text-gray-500">Пусто</td></tr>
          </tbody>
        </table>
      </div>
    </div>

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
