<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="w-full max-w-xl rounded-2xl bg-white shadow p-6">
      <h1 class="text-2xl font-semibold">Что-то пошло не так</h1>
      <p class="mt-2 text-sm text-gray-600">
        Если ошибка повторяется — скинь нам код запроса (Request ID), мы быстрее найдём причину.
      </p>

      <div class="mt-6 space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-500">Код ошибки</span>
          <span class="font-medium">{{ error?.statusCode || '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-500">Request ID</span>
          <span class="font-mono text-xs">{{ requestId || '—' }}</span>
        </div>
      </div>

      <details class="mt-6">
        <summary class="cursor-pointer text-sm text-gray-700">Детали</summary>
        <pre class="mt-2 text-xs bg-gray-100 rounded-xl p-3 overflow-auto">{{ prettyError }}</pre>
      </details>

      <div class="mt-6 flex gap-2">
        <BaseButton
          variant="primary"
          @click="reload"
        >
          Обновить
        </BaseButton>
        <BaseButton variant="secondary" to="/">
          На главную
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const requestId = computed(() => {
  const anyErr: any = props.error
  return anyErr?.data?.requestId || anyErr?.requestId || anyErr?.data?.error?.requestId
})

const prettyError = computed(() => {
  try {
    return JSON.stringify(props.error, null, 2)
  } catch {
    return String(props.error)
  }
})

function reload() {
  if (process.client) window.location.reload()
}
</script>
