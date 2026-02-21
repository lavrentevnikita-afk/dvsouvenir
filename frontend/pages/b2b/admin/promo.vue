<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'b2b', middleware: ['b2b', 'staff'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const error = ref<string | null>(null)
const banners = ref<any[]>([])

const editOpen = ref(false)
const editing = ref<any>(null)

const form = reactive({
  title: '',
  type: 'banner',
  text: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  isActive: true,
  startAt: '',
  endAt: '',
})

function toInputDate(v: any) {
  if (!v) return ''
  const d = new Date(v)
  if (isNaN(d.getTime())) return ''
  // yyyy-MM-ddTHH:mm (local)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function load() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/content/promo-banners', {
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    banners.value = Array.isArray(res?.banners) ? res.banners : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить промо'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  Object.assign(form, { title: '', type: 'banner', text: '', imageUrl: '', linkUrl: '', sortOrder: 0, isActive: true, startAt: '', endAt: '' })
  editOpen.value = true
}

function openEdit(b: any) {
  editing.value = b
  Object.assign(form, {
    title: b.title || '',
    type: b.type || 'banner',
    text: b.text || '',
    imageUrl: b.imageUrl || '',
    linkUrl: b.linkUrl || '',
    sortOrder: b.sortOrder || 0,
    isActive: !!b.isActive,
    startAt: toInputDate(b.startAt),
    endAt: toInputDate(b.endAt),
  })
  editOpen.value = true
}

async function save() {
  if (!auth.accessToken) return
  try {
    const body: any = {
      title: form.title,
      type: form.type,
      text: form.text || null,
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl,
      sortOrder: Number(form.sortOrder || 0),
      isActive: !!form.isActive,
      startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
      endAt: form.endAt ? new Date(form.endAt).toISOString() : null,
    }
    if (!editing.value) {
      await $fetch('/api/admin/content/promo-banners', {
        method: 'POST',
        baseURL: apiBaseUrl,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        body,
      })
    } else {
      await $fetch(`/api/admin/content/promo-banners/${editing.value.id}`, {
        method: 'PATCH',
        baseURL: apiBaseUrl,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        body,
      })
    }
    editOpen.value = false
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить'
  }
}

async function toggle(b: any) {
  if (!auth.accessToken) return
  try {
    await $fetch(`/api/admin/content/promo-banners/${b.id}`, {
      method: 'PATCH',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      body: { isActive: !b.isActive },
    })
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось обновить'
  }
}

async function remove(b: any) {
  if (!auth.accessToken) return
  if (!confirm('Удалить промо?')) return
  try {
    await $fetch(`/api/admin/content/promo-banners/${b.id}`, {
      method: 'DELETE',
      baseURL: apiBaseUrl,
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось удалить'
  }
}

const now = computed(() => new Date())
function isActiveNow(b: any) {
  if (!b.isActive) return false
  const n = now.value.getTime()
  const s = b.startAt ? new Date(b.startAt).getTime() : null
  const e = b.endAt ? new Date(b.endAt).getTime() : null
  if (s && n < s) return false
  if (e && n > e) return false
  return true
}

onMounted(load)
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">Промо</h1>
        <p class="text-sm text-gray-600 mt-1">Баннеры и плашки по датам</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="load">Обновить</button>
        <button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90" @click="openCreate">Добавить</button>
      </div>
    </div>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
    <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th class="text-left px-4 py-3">Заголовок</th>
              <th class="text-left px-4 py-3">Тип</th>
              <th class="text-left px-4 py-3">Период</th>
              <th class="text-center px-4 py-3">Активен сейчас?</th>
              <th class="text-right px-4 py-3">Приоритет</th>
              <th class="text-right px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in banners" :key="b.id" class="border-t border-gray-100">
              <td class="px-4 py-3">
                <div class="font-medium">{{ b.title }}</div>
                <div v-if="b.type==='badge' && b.text" class="text-xs text-gray-500 mt-1 line-clamp-2">{{ b.text }}</div>
                <div v-if="b.type==='banner'" class="text-xs text-gray-500 mt-1 truncate">{{ b.imageUrl }}</div>
              </td>
              <td class="px-4 py-3">{{ b.type }}</td>
              <td class="px-4 py-3">
                <div class="text-xs text-gray-700">{{ b.startAt ? new Date(b.startAt).toLocaleString() : '—' }}</div>
                <div class="text-xs text-gray-700">{{ b.endAt ? new Date(b.endAt).toLocaleString() : '—' }}</div>
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                  :class="isActiveNow(b) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'"
                >
                  {{ isActiveNow(b) ? 'да' : 'нет' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">{{ b.sortOrder }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="toggle(b)">
                    {{ b.isActive ? 'Выключить' : 'Включить' }}
                  </button>
                  <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="openEdit(b)">Редактировать</button>
                  <button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs" @click="remove(b)">Удалить</button>
                </div>
              </td>
            </tr>
            <tr v-if="banners.length===0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500">Пусто</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="editOpen" class="fixed inset-0 z-[2000] bg-black/30 flex items-end sm:items-center justify-center p-4">
      <div class="w-full max-w-xl rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <div class="font-semibold">{{ editing ? 'Редактировать промо' : 'Новое промо' }}</div>
          <button class="text-sm text-gray-500 hover:text-gray-900" @click="editOpen=false">✕</button>
        </div>
        <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="text-xs text-gray-600">Заголовок</label>
            <input v-model="form.title" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <label class="text-xs text-gray-600">Тип</label>
            <select v-model="form.type" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
              <option value="banner">banner</option>
              <option value="badge">badge</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-gray-600">Приоритет</label>
            <input type="number" v-model.number="form.sortOrder" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div class="sm:col-span-2" v-if="form.type==='badge'">
            <label class="text-xs text-gray-600">Текст (плашка)</label>
            <textarea v-model="form.text" rows="3" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div class="sm:col-span-2" v-else>
            <label class="text-xs text-gray-600">Image URL</label>
            <input v-model="form.imageUrl" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="/uploads/..." />
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs text-gray-600">Ссылка</label>
            <input v-model="form.linkUrl" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <label class="text-xs text-gray-600">StartAt</label>
            <input type="datetime-local" v-model="form.startAt" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <label class="text-xs text-gray-600">EndAt</label>
            <input type="datetime-local" v-model="form.endAt" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div class="sm:col-span-2 flex items-center gap-2">
            <input id="isActive" type="checkbox" v-model="form.isActive" />
            <label for="isActive" class="text-sm">Включено</label>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="editOpen=false">Отмена</button>
          <button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90" @click="save">Сохранить</button>
        </div>
      </div>
    </div>
  </section>
</template>
