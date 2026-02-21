<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

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
    <!-- Header -->
    <AdminPageHeader 
      title="Промо" 
      description="Баннеры и плашки по датам" 
      icon="✨"
    >
      <template #actions>
        <AdminButton @click="load">
          Обновить
        </AdminButton>
        <AdminButton variant="primary" @click="openCreate">
          Добавить
        </AdminButton>
      </template>
    </AdminPageHeader>

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
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
            <tr>
              <th class="text-left px-5 py-3.5 font-semibold">Заголовок</th>
              <th class="text-left px-5 py-3.5 font-semibold">Тип</th>
              <th class="text-left px-5 py-3.5 font-semibold">Период</th>
              <th class="text-center px-5 py-3.5 font-semibold">Статус</th>
              <th class="text-right px-5 py-3.5 font-semibold">Приоритет</th>
              <th class="text-right px-5 py-3.5 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in banners" :key="b.id" class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
              <td class="px-5 py-4">
                <div class="font-semibold text-slate-900">{{ b.title }}</div>
                <div v-if="b.type==='badge' && b.text" class="text-xs text-slate-500 mt-1 line-clamp-2">{{ b.text }}</div>
                <div v-if="b.type==='banner'" class="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{{ b.imageUrl }}</div>
              </td>
              <td class="px-5 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border" :class="b.type === 'banner' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'">
                  {{ b.type === 'banner' ? '🖼️ Баннер' : '🏷️ Плашка' }}
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="text-xs text-slate-700">📅 {{ b.startAt ? new Date(b.startAt).toLocaleString() : '—' }}</div>
                <div class="text-xs text-slate-500">→ {{ b.endAt ? new Date(b.endAt).toLocaleString() : '∞' }}</div>
              </td>
              <td class="px-5 py-4 text-center">
                <AdminStatusBadge 
                  :status="isActiveNow(b) ? 'active' : 'inactive'" 
                  :map="{ active: { label: '✅ Активен', color: 'green' }, inactive: { label: 'Неактивен', color: 'slate' } }" 
                />
              </td>
              <td class="px-5 py-4 text-right font-medium text-slate-700">{{ b.sortOrder }}</td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <AdminButton size="sm" @click="toggle(b)">
                    {{ b.isActive ? '⏸️' : '▶️' }}
                  </AdminButton>
                  <AdminButton size="sm" @click="openEdit(b)">
                    ✏️
                  </AdminButton>
                  <AdminButton size="sm" variant="danger" @click="remove(b)">
                    🗑️
                  </AdminButton>
                </div>
              </td>
            </tr>
            <tr v-if="banners.length===0">
              <td colspan="6" class="px-5 py-12 text-center text-slate-500">
                <div class="text-4xl mb-2">✨</div>
                <div>Промо не найдены</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminCard>

    <!-- Edit Modal -->
    <div v-if="editOpen" class="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div class="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div class="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent flex items-center justify-between">
          <div class="font-bold text-slate-800">{{ editing ? '✏️ Редактировать промо' : '➕ Новое промо' }}</div>
          <button class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors" @click="editOpen=false">✕</button>
        </div>
        <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Заголовок</label>
            <AdminInput v-model="form.title" placeholder="Название промо" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Тип</label>
            <AdminSelect 
              v-model="form.type" 
              :options="[
                { value: 'banner', label: 'Баннер', icon: '🖼️' },
                { value: 'badge', label: 'Плашка', icon: '🏷️' },
              ]"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Приоритет</label>
            <AdminInput type="number" v-model.number="form.sortOrder" />
          </div>
          <div class="sm:col-span-2" v-if="form.type==='badge'">
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Текст (плашка)</label>
            <textarea v-model="form.text" rows="3" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all" />
          </div>
          <div class="sm:col-span-2" v-else>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Image URL</label>
            <AdminInput v-model="form.imageUrl" placeholder="/uploads/..." />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Ссылка</label>
            <AdminInput v-model="form.linkUrl" placeholder="https://..." />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Начало</label>
            <AdminInput type="datetime-local" v-model="form.startAt" />
          </div>
          <div>
            <label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Окончание</label>
            <AdminInput type="datetime-local" v-model="form.endAt" />
          </div>
          <div class="sm:col-span-2">
            <label class="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" v-model="form.isActive" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
              <span class="text-sm font-medium text-slate-700">Активировать промо</span>
            </label>
          </div>
        </div>
        <div class="p-5 border-t border-slate-100 flex items-center justify-end gap-3">
          <AdminButton @click="editOpen=false">Отмена</AdminButton>
          <AdminButton variant="primary" @click="save">💾 Сохранить</AdminButton>
        </div>
      </div>
    </div>
  </section>
</template>
