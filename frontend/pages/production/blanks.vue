<script setup lang="ts">
definePageMeta({ layout: 'production', middleware: ['production'] })

import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const loading = ref(false)
const saving = ref<number | null>(null)
const error = ref('')
const q = ref('')

const stocks = ref<Array<any>>([])
const rowState = ref<Record<number, { receiveQty: number; actualQty: number }>>({})

function authHeaders() {
  return auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}
}


function row(pid: number) {
  if (!rowState.value[pid]) rowState.value[pid] = { receiveQty: 0, actualQty: 0 }
  return rowState.value[pid]
}

function initRowState() {
  const next: Record<number, { receiveQty: number; actualQty: number }> = {}
  for (const s of stocks.value) {
    const pid = Number(s?.product?.id)
    if (!pid) continue
    next[pid] = {
      receiveQty: 0,
      actualQty: Math.max(0, Number(s?.qty || 0)),
    }
  }
  rowState.value = next
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await $fetch<any>('/api/production/blanks/stocks', {
      baseURL: apiBaseUrl,
      headers: authHeaders(),
      query: { q: q.value || undefined },
    })
    stocks.value = Array.isArray(res?.stocks) ? res.stocks : []
    initRowState()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить заготовки'
  } finally {
    loading.value = false
  }
}

async function receive(pid: number) {
  const qty = Number(rowState.value[pid]?.receiveQty || 0)
  if (!qty || qty <= 0) return
  saving.value = pid
  try {
    await $fetch('/api/production/blanks/receive', {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: authHeaders(),
      body: { productId: pid, qty, note: 'Быстрый приход из production панели' },
    })
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить приход'
  } finally {
    saving.value = null
  }
}

async function adjust(pid: number) {
  const qty = Number(rowState.value[pid]?.actualQty || 0)
  if (qty < 0) return
  saving.value = pid
  try {
    await $fetch('/api/production/blanks/adjust', {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: authHeaders(),
      body: { productId: pid, qty, note: 'Инвентаризация из production панели' },
    })
    await load()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось применить инвентаризацию'
  } finally {
    saving.value = null
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-4">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold">Заготовки — быстрая инвентаризация</h1>
        <p class="text-sm text-gray-500">Один экран для прихода и корректировки фактического остатка BLANKS.</p>
      </div>
      <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" :disabled="loading" @click="load">Обновить</button>
    </header>

    <div class="rounded-2xl border border-gray-200 bg-white p-4">
      <div class="flex gap-2">
        <input v-model="q" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="Поиск по названию / артикулу" @keydown.enter="load" />
        <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" :disabled="loading" @click="load">Найти</button>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div v-if="loading" class="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">Загружаю данные…</div>

    <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-xs text-gray-600">
          <tr>
            <th class="text-left px-3 py-2">Заготовка</th>
            <th class="text-left px-3 py-2">Артикул</th>
            <th class="text-right px-3 py-2">Текущий остаток</th>
            <th class="text-right px-3 py-2">Быстрый приход</th>
            <th class="text-right px-3 py-2">Факт (инв.)</th>
            <th class="text-right px-3 py-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in stocks" :key="s.id" class="border-t border-gray-100">
            <td class="px-3 py-2">{{ s.product?.name || '—' }}</td>
            <td class="px-3 py-2 font-mono text-xs text-gray-600">{{ s.product?.article || '—' }}</td>
            <td class="px-3 py-2 text-right font-medium">{{ Number(s.qty || 0) }}</td>
            <td class="px-3 py-2 text-right">
              <input v-model.number="row(s.product?.id).receiveQty" min="0" type="number" class="w-24 rounded-lg border border-gray-200 px-2 py-1 text-right" />
            </td>
            <td class="px-3 py-2 text-right">
              <input v-model.number="row(s.product?.id).actualQty" min="0" type="number" class="w-24 rounded-lg border border-gray-200 px-2 py-1 text-right" />
            </td>
            <td class="px-3 py-2">
              <div class="flex justify-end gap-2">
                <button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs" :disabled="saving === s.product?.id" @click="receive(s.product?.id)">Приход</button>
                <button class="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs disabled:opacity-60" :disabled="saving === s.product?.id" @click="adjust(s.product?.id)">Инвентаризация</button>
              </div>
            </td>
          </tr>
          <tr v-if="stocks.length === 0" class="border-t border-gray-100">
            <td colspan="6" class="px-3 py-6 text-center text-gray-500">Нет заготовок по текущему фильтру.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
