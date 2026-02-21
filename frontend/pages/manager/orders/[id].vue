<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <!-- Загрузка -->
      <div v-if="pending" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Загрузка заказа...</p>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700">{{ error.message || 'Ошибка загрузки заказа' }}</p>
        <NuxtLink to="/manager/orders" class="mt-4 inline-block text-blue-600 hover:text-blue-800">
          ← Вернуться к списку
        </NuxtLink>
      </div>

      <!-- Детали заказа -->
      <div v-else-if="order" class="space-y-6">
        <!-- Заголовок -->
        <div class="flex justify-between items-center">
          <div>
            <NuxtLink to="/manager/orders" class="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
              ← Вернуться к списку
            </NuxtLink>
            <h1 class="text-3xl font-bold">Заказ #{{ order.id }}</h1>
            <p class="text-gray-600 mt-1">от {{ formatDate(order.createdAt) }}</p>
          </div>
          <span :class="getStatusClass(order.status)" class="px-4 py-2 text-sm font-semibold rounded-full">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Основная информация -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Товары -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Товары</h2>
              <div class="space-y-4">
                <div v-for="item in order.items" :key="item.id" class="flex gap-4 pb-4 border-b last:border-0">
                  <img
                    v-if="item.product?.assets?.[0]"
                    :src="getImageUrl(item.product.assets[0])"
                    :alt="item.productName"
                    class="w-20 h-20 object-cover rounded"
                  >
                  <div class="flex-1">
                    <h3 class="font-medium">{{ item.productName }}</h3>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ item.quantity }} × {{ formatPrice(item.unitPrice) }}
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">{{ formatPrice(item.lineTotal) }}</p>
                  </div>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t flex justify-between items-center">
                <span class="text-lg font-semibold">Итого:</span>
                <span class="text-2xl font-bold text-blue-600">{{ formatPrice(order.totalPrice) }}</span>
              </div>
            </div>

            <!-- Изменение статуса -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Управление заказом</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Изменить статус</label>
                  <select v-model="newStatus" class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="new">Новый</option>
                    <option value="processing">В обработке</option>
                    <option value="ready">Готов</option>
                    <option value="shipped">Отгружен</option>
                    <option value="delivered">Доставлен</option>
                    <option value="cancelled">Отменен</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Примечание (необязательно)</label>
                  <textarea
                    v-model="statusNote"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Добавьте комментарий..."
                  ></textarea>
                </div>
                <button
                  @click="updateStatus"
                  :disabled="updatingStatus || newStatus === order.status"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {{ updatingStatus ? 'Обновление...' : 'Обновить статус' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Боковая панель -->
          <div class="space-y-6">
            <!-- Информация о клиенте -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h2 class="text-xl font-semibold mb-4">Клиент</h2>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-600">Имя</p>
                  <p class="font-medium">{{ order.customerName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Email</p>
                  <p class="font-medium">{{ order.email }}</p>
                </div>
                <div v-if="order.phone">
                  <p class="text-sm text-gray-600">Телефон</p>
                  <p class="font-medium">{{ order.phone }}</p>
                </div>
              </div>
            </div>

            <!-- Блок доставки удалён -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig, navigateTo, useAsyncData, useHead } from '#app'
import { useToast } from '~/composables/useToast'

const route = useRoute()
const authStore = useAuthStore()
const config = useRuntimeConfig()
const toast = useToast()

// Проверка роли
if (!['manager', 'admin'].includes(authStore.user?.role || '')) {
  navigateTo('/')
}

const orderId = parseInt(route.params.id as string)

const { data: order, pending, error, refresh } = await useAsyncData(
  `manager-order-${orderId}`,
  () => $fetch(`/api/manager/orders/${orderId}`, {
    baseURL: config.public.apiBaseUrl,
    headers: authStore.accessToken ? {
      Authorization: `Bearer ${authStore.accessToken}`
    } : undefined
  })
)

const newStatus = ref(order.value?.status || 'new')
const statusNote = ref('')
const updatingStatus = ref(false)

watch(() => order.value?.status, (status) => {
  if (status) newStatus.value = status
})

const updateStatus = async () => {
  if (!order.value || newStatus.value === order.value.status) return

  updatingStatus.value = true
  try {
    await $fetch(`/api/manager/orders/${orderId}/status`, {
      method: 'PATCH',
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      },
      body: {
        status: newStatus.value,
        note: statusNote.value || undefined
      }
    })

    toast.success('Статус заказа обновлен')
    statusNote.value = ''
    await refresh()
  } catch (err: any) {
    toast.error(err.data?.message || 'Ошибка обновления статуса')
  } finally {
    updatingStatus.value = false
  }
}

const getImageUrl = (asset: string) => {
  if (asset.startsWith('http')) return asset
  return `${config.public.apiBaseUrl}/uploads/products/${asset}`
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(price)
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    new: 'Новый',
    processing: 'В обработке',
    ready: 'Готов',
    shipped: 'Отгружен',
    delivered: 'Доставлен',
    cancelled: 'Отменен'
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    ready: 'bg-green-100 text-green-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

useHead({
  title: `Заказ #${orderId} - Менеджер`,
})
</script>
