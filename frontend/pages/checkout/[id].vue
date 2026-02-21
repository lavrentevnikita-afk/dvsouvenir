<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig } from '#app'
import { ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const order = ref<any>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const id = route.params.id
  if (!authStore.accessToken) {
    router.push('/login')
    return
  }
  try {
    order.value = await $fetch(`/api/orders/${id}`, {
      baseURL: config.public.apiBaseUrl,
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    })
  } catch (e: any) {
    error.value = e?.data?.message || 'Ошибка загрузки заказа'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="max-w-2xl mx-auto mt-8 bg-white rounded-card shadow-sm p-6">
    <div v-if="loading" class="text-center text-gray-400 py-8">Загрузка заказа...</div>
    <div v-else-if="error" class="text-center text-red-500 py-8">{{ error }}</div>
    <div v-else-if="order" class="space-y-4">
      <h1 class="text-xl font-semibold mb-2">Заказ #{{ order.id }}</h1>
      <div class="text-sm text-gray-500 mb-2">от {{ new Date(order.createdAt).toLocaleString('ru-RU') }}</div>
      <div class="mb-4">
        <div><b>Имя:</b> {{ order.customerName }}</div>
        <div><b>Email:</b> {{ order.email }}</div>
        <div><b>Телефон:</b> {{ order.phone }}</div>
        <div><b>Адрес:</b> {{ order.address }}</div>
        <div><b>Комментарий:</b> {{ order.comment || '—' }}</div>
        <div><b>Статус:</b> {{ order.status }}</div>
      </div>
      <div>
        <h2 class="font-semibold mb-2">Товары</h2>
        <ul class="space-y-2">
          <li v-for="item in order.items" :key="item.productId" class="flex justify-between border-b pb-1">
            <span>{{ item.name }}</span>
            <span>x{{ item.quantity }}</span>
            <span>{{ item.price }} ₽</span>
          </li>
        </ul>
      </div>
      <div class="mt-4 text-right text-lg font-bold">Итого: {{ order.totalPrice }} ₽</div>
    </div>
  </section>
</template>
