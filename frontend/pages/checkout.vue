<script setup lang="ts">
import { mapErrorToUi, normalizeApiError } from '~/utils/app-error'
const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  comment: ''
})

function onPhoneInput(e: Event) {
  const target = e.target as HTMLInputElement
  let v = String(target.value || '').replace(/\D/g, '')
  if (!v.startsWith('7')) v = '7' + v.replace(/^7*/, '')
  v = v.slice(0, 11)
  form.phone = '+' + v
}

function onPhoneKeydown(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End']
  if (allowed.includes(e.key)) return
  if (e.ctrlKey || e.metaKey) return

  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
    return
  }

  const target = e.target as HTMLInputElement
  const digits = String(form.phone || '').replace(/\D/g, '')
  const hasSelection = (target.selectionStart ?? 0) !== (target.selectionEnd ?? 0)
  if (digits.length >= 11 && !hasSelection) {
    e.preventDefault()
  }
}

// автозаполнение из профиля
onMounted(async () => {
  if (!authStore.accessToken) return
  try {
    const { user } = await $fetch<{ user: any }>('/api/users/me', {
      baseURL: config.public.apiBaseUrl,
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    })

    if (!form.name) form.name = user?.name ?? ''
    if (!form.phone) form.phone = user?.phone ?? ''
    if (!form.email) form.email = user?.email ?? ''
  } catch {
    // молча, оформление не должно ломаться
  }
})

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const errorHint = ref<{ title: string; text: string; actionLabel?: string; action?: string } | null>(null)

const cartPreview = ref<{ items: any[]; totals: { retail: number; discount: number; final: number }; canCheckout: boolean } | null>(null)

async function refreshCartPreview() {
  if (cartStore.isEmpty) {
    cartPreview.value = { items: [], totals: { retail: 0, discount: 0, final: 0 }, canCheckout: false }
    return
  }
  try {
    cartPreview.value = await $fetch('/api/cart/preview', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      body: {
        items: cartStore.items.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
      },
      headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : undefined,
    }) as any
  } catch {
    // не валим оформление, но дальше сервер всё равно провалидирует создание заказа
    cartPreview.value = null
  }
}

watch(
  () => cartStore.items.map((i) => [i.product.id, i.quantity]),
  () => refreshCartPreview(),
  { deep: true, immediate: true },
)

const hasItems = computed(() => !cartStore.isEmpty)

async function submitOrder() {
  if (!authStore.accessToken) {
    errorMessage.value = 'Нужно войти в аккаунт, чтобы оформить заказ.'
    router.push('/login')
    return
  }

  if (!hasItems.value) {
    errorMessage.value = 'Корзина пуста. Добавьте товары перед оформлением заказа.'
    return
  }

  // availability check before submit
  await refreshCartPreview()
  if (cartPreview.value && cartPreview.value.canCheckout === false) {
    errorMessage.value = 'Некоторые товары сейчас недоступны. Уберите их из корзины, чтобы оформить заказ.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null
  errorHint.value = null

  try {
    const body = {
      customerName: form.name,
      phone: form.phone || undefined,
      // email берём из формы, а если пусто — из токена
      email: form.email || authStore.user?.email || undefined,
      comment: form.comment || undefined,
      items: cartStore.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    }

    const response = await $fetch<{ id: number }>('/api/orders', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })

    cartStore.clear()
    router.push(`/order/${response.id}`)
  } catch (error: any) {
    const ui = mapErrorToUi(normalizeApiError(error))
    errorHint.value = ui
    errorMessage.value = ui.text
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h1 class="text-xl font-semibold">Оформление заказа</h1>
      <p class="text-sm text-gray-600">
        Заполните данные для оформления B2B-заказа.
      </p>
    </header>

    <div v-if="cartStore.isEmpty" class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
      Корзина пуста. Сначала добавьте товары.
      <div class="mt-3">
        <NuxtLink
          to="/catalog"
          class="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
        >
          В каталог
        </NuxtLink>
      </div>
    </div>

    <form
      v-else
      class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start"
      @submit.prevent="submitOrder"
    >
      <div class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Имя и фамилия
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <input
              :value="form.phone"
              @input="onPhoneInput"
              @keydown="onPhoneKeydown"
              type="tel"
              required
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="+7XXXXXXXXXX"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              E-mail (по желанию)
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              Комментарий к заказу
            </label>
            <textarea
              v-model="form.comment"
              rows="3"
              class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400 resize-none"
              placeholder="Например, удобное время для звонка или доставки"
            />
          </div>
        </div>

        <div v-if="errorHint" class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <div class="font-medium">{{ errorHint.title }}</div>
          <div class="mt-1">{{ errorHint.text }}</div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-if="errorHint.action === 'refresh_cart'"
              type="button"
              class="inline-flex items-center rounded-full bg-red-700 px-3 py-1 text-[11px] font-medium text-white"
              @click="router.push('/cart')"
            >
              Обновить корзину
            </button>
            <button
              v-if="errorHint.action === 'relogin'"
              type="button"
              class="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white"
              @click="router.push('/login')"
            >
              Войти
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="mt-2 inline-flex items-center rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Отправляем заказ...</span>
          <span v-else>Подтвердить заказ</span>
        </button>
      </div>

      <aside class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <h2 class="text-sm font-semibold">Ваш заказ</h2>

        <ul class="space-y-2 max-h-64 overflow-y-auto pr-1">
          <li
            v-for="item in cartStore.items"
            :key="item.product.id"
            class="flex justify-between gap-2 text-xs"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-900 line-clamp-2">
                {{ item.product.name }}
              </p>
              <p class="text-[11px] text-gray-500">
                x{{ item.quantity }}
              </p>
            </div>
            <div class="text-right whitespace-nowrap">
              <p class="font-semibold">
                {{ Math.round((cartPreview?.items?.find((p:any)=>p.product.id===item.product.id)?.price?.finalLine ?? (item.product.price * item.quantity))) }} ₽
              </p>
            </div>
          </li>
        </ul>

        <div class="flex justify-between text-sm font-semibold">
          <span>Итого</span>
          <span>{{ Math.round((cartPreview?.totals?.final ?? cartStore.totalPrice)) }} ₽</span>
        </div>
      </aside>
    </form>
  </section>
</template>
