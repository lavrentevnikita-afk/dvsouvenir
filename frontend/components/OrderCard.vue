const goToCheckout = () => {
  const url = `http://localhost:3000/order/${props.order.id}`
  console.log('Redirecting to:', url)
  window.location.href = url
  setTimeout(() => {
    window.location.replace(url)
  }, 500)
}

<template>
  <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <!-- Основная информация -->
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="text-lg font-semibold">Заказ #{{ props.order.id }}</h3>
          <BaseBadge :variant="statusVariant" size="sm">{{ statusText }}</BaseBadge>
        </div>
        <p class="text-sm text-gray-600">{{ formattedDate }}</p>
        <div class="mt-3">
          <p class="text-sm text-gray-700">
            {{ itemsPreview }}
          </p>
        </div>
      </div>
      <!-- Цена и действия -->
      <div class="flex flex-col items-end gap-3">
        <div class="text-right">
          <p class="text-2xl font-bold text-gray-900">{{ formattedPrice }} ₽</p>
          <p v-if="props.order.discountPercent > 0" class="text-sm text-green-600">
            Скидка {{ props.order.discountPercent }}%
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            @click="goToOrderDetails"
            class="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm"
            type="button"
          >
            Подробнее
          </button>
          const goToOrderDetails = () => {
            if (typeof window !== 'undefined') {
              window.location.href = `/order/${props.order.id}`;
            }
          }
          <BaseButton
            v-if="localStatus === 'shipped' && !confirming"
            @click="confirmReceived"
            variant="success"
            size="sm"
          >
            Подтвердить получение
          </BaseButton>
          <BaseButton
            @click="repeatOrder"
            variant="secondary"
            size="sm"
          >
            Повторить заказ
          </BaseButton>
          <span v-if="confirming" class="text-green-600 text-sm ml-2">Подтверждение...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo } from '#app'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig } from '#app'

const props = defineProps<{
  order: {
    id: number
    customerName: string
    email: string
    phone: string | null
    address: string
    totalPrice: string
    discountPercent: number
    status: string
    items: Array<{
      productId: number
      name: string
      quantity: number
      price: string
    }>
    createdAt: string
  }
}>()

const localStatus = ref(props.order.status)
const confirming = ref(false)

const statuses: Record<string, string> = {
  new: 'Новый',
  processing: 'В обработке',
  ready: 'Готов',
  shipped: 'Отгружен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
}
const statusText = computed(() => {
  return statuses[localStatus.value] || localStatus.value
})

const variants: Record<string, string> = {
  new: 'info',
  processing: 'warning',
  ready: 'success',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}
const statusVariant = computed(() => {
  return variants[localStatus.value] || 'neutral'
})
// Expose goToOrderDetails to template
defineExpose({ goToOrderDetails })

const formattedDate = computed(() => {
  if (!props.order.createdAt) return ''
  const date = new Date(props.order.createdAt)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const formattedPrice = computed(() => {
  if (!props.order.totalPrice) return ''
  return Number(props.order.totalPrice).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
})

const itemsPreview = computed(() => {
  const items = props.order.items || []
  if (items.length === 0) return 'Нет товаров'
  const first2 = items.slice(0, 2)
  const names = first2.map(item => `${item.name} (${item.quantity} шт.) — ${item.price} ₽`)
  if (items.length > 2) {
    return names.join(', ') + ` и еще ${items.length - 2}...`
  }
  return names.join(', ')
})


const confirmReceived = async () => {
  if (confirming.value) return
  confirming.value = true
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/api/orders/${props.order.id}/confirm-received`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) throw new Error('Ошибка подтверждения получения заказа')

    // После подтверждения — повторно получить заказ и обновить статус
    const orderResp = await fetch(`${config.public.apiBaseUrl}/api/orders/${props.order.id}`, {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    if (orderResp.ok) {
      const updatedOrder = await orderResp.json()
      localStatus.value = updatedOrder.status || 'delivered'
    } else {
      localStatus.value = 'delivered'
    }
  } catch (error) {
    alert('Не удалось подтвердить получение заказа')
  } finally {
    confirming.value = false
  }
}

const cartStore = useCartStore()
const authStore = useAuthStore()
const config = useRuntimeConfig()

const repeatOrder = async () => {
  // Добавляем все товары из заказа в корзину
  for (const item of props.order.items || []) {
    cartStore.addItem({
      id: item.productId,
      name: item.name,
      price: Number(item.price),
    }, item.quantity)
  }
  // Переходим в корзину
  navigateTo('/cart')
}

</script>
