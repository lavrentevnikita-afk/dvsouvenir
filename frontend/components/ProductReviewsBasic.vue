<script setup lang="ts">
const props = defineProps<{ productId: number; productName?: string }>()

type Review = {
  id: string
  name: string
  rating: number
  text: string
  createdAt: string
}

const STORAGE_PREFIX = 'reviews:'

const key = computed(() => `${STORAGE_PREFIX}${props.productId}`)
const list = ref<Review[]>([])

const form = reactive({ name: '', rating: 5, text: '' })
const error = ref<string | null>(null)

function load() {
  if (!process.client) return
  try {
    const raw = window.localStorage.getItem(key.value)
    if (!raw) {
      list.value = []
      return
    }
    const parsed = JSON.parse(raw)
    list.value = Array.isArray(parsed) ? parsed : []
  } catch {
    list.value = []
  }
}

function save() {
  if (!process.client) return
  try {
    window.localStorage.setItem(key.value, JSON.stringify(list.value))
  } catch {
    // ignore
  }
}

function submit() {
  error.value = null
  const name = form.name.trim()
  const text = form.text.trim()
  const rating = Number(form.rating)

  if (!name) {
    error.value = 'Введите имя'
    return
  }
  if (!text) {
    error.value = 'Напишите пару слов в отзыве'
    return
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    error.value = 'Оценка должна быть от 1 до 5'
    return
  }

  list.value.unshift({
    id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name,
    rating,
    text,
    createdAt: new Date().toISOString(),
  })
  save()
  form.name = ''
  form.rating = 5
  form.text = ''
}

onMounted(load)
watch(() => props.productId, load)

const avg = computed(() => {
  if (!list.value.length) return 0
  const sum = list.value.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
  return Math.round((sum / list.value.length) * 10) / 10
})
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 class="text-base font-semibold">Отзывы</h2>
        <p class="text-xs text-gray-500">
          Базовые отзывы (без модерации) сохраняются в вашем браузере.
        </p>
      </div>
      <div class="text-right" v-if="list.length">
        <p class="text-xs text-gray-500">Средняя оценка</p>
        <p class="text-sm font-semibold">{{ avg }} / 5</p>
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 bg-white p-4">
      <form class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]" @submit.prevent="submit">
        <div class="space-y-2">
          <label class="block">
            <span class="text-xs text-gray-500">Имя</span>
            <input
              v-model="form.name"
              type="text"
              placeholder="Например, Анна"
              class="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </label>
          <label class="block">
            <span class="text-xs text-gray-500">Отзыв</span>
            <textarea
              v-model="form.text"
              rows="3"
              placeholder="Что понравилось?"
              class="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            />
          </label>
          <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
        </div>

        <div class="space-y-2">
          <label class="block">
            <span class="text-xs text-gray-500">Оценка</span>
            <select
              v-model.number="form.rating"
              class="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
          <button
            type="submit"
            class="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Оставить отзыв
          </button>
        </div>
      </form>
    </div>

    <div v-if="!list.length" class="text-sm text-gray-500">
      Пока нет отзывов. Будьте первым!
    </div>

    <ul v-else class="space-y-3">
      <li v-for="r in list" :key="r.id" class="rounded-lg border border-gray-200 bg-white p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ r.name }}</p>
            <p class="text-xs text-gray-500">{{ new Date(r.createdAt).toLocaleDateString() }}</p>
          </div>
          <div class="text-xs font-semibold text-gray-800">{{ r.rating }} / 5</div>
        </div>
        <p class="mt-2 text-sm text-gray-700 whitespace-pre-line">{{ r.text }}</p>
      </li>
    </ul>
  </section>
</template>
