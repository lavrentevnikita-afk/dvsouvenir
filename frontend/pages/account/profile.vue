import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig } from '#app'
import { useToast } from '~/composables/useToast'
import { useCityStore } from '~/stores/city'
import { useHead } from '@vueuse/head'
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Хлебные крошки -->
    <nav class="flex items-center gap-2 text-sm text-slate-500 mb-4">
      <NuxtLink to="/account" class="hover:text-slate-900 transition">Личный кабинет</NuxtLink>
      <span>→</span>
      <span class="text-slate-900">Редактирование профиля</span>
    </nav>

    <h1 class="text-3xl font-bold mb-6">Редактирование профиля</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Основная информация -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold mb-4">Основная информация</h2>
        <form @submit.prevent="updateProfile" class="space-y-4">
          <BaseInput
            v-model="profileForm.name"
            type="text"
            label="Имя"
            placeholder="Ваше имя"
          />

          <BaseInput
            v-model="profileForm.email"
            type="email"
            label="Email"
            placeholder="your@email.com"
          />

          <BaseInput
            v-model="profileForm.phone"
            type="tel"
            label="Телефон"
            placeholder="+7 (999) 123-45-67"
          />

          <BaseInput
            v-model="profileForm.city"
            type="text"
            label="Город"
            placeholder="Москва"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Адрес доставки</label>
            <textarea
              v-model="profileForm.address"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Улица, дом, квартира"
            ></textarea>
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="updatingProfile"
            :disabled="updatingProfile"
            full-width
          >
            {{ updatingProfile ? 'Сохранение...' : 'Сохранить изменения' }}
          </BaseButton>
        </form>
      </div>

      <!-- Смена пароля -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-semibold mb-4">Смена пароля</h2>
        <form @submit.prevent="changePassword" class="space-y-4">
          <BaseInput
            v-model="passwordForm.currentPassword"
            type="password"
            label="Текущий пароль"
            placeholder="••••••••"
          />

          <BaseInput
            v-model="passwordForm.newPassword"
            type="password"
            label="Новый пароль"
            placeholder="••••••••"
            hint="Минимум 8 символов, заглавные и строчные буквы, цифры"
          />

          <BaseInput
            v-model="passwordForm.confirmPassword"
            type="password"
            label="Подтвердите новый пароль"
            placeholder="••••••••"
          />

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="changingPassword"
            :disabled="changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword"
            full-width
          >
            {{ changingPassword ? 'Изменение...' : 'Изменить пароль' }}
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const config = useRuntimeConfig()
const toast = useToast()

const profileForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  city: authStore.user?.city || '',
  address: authStore.user?.address || '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const updatingProfile = ref(false)
const changingPassword = ref(false)

const updateProfile = async () => {
  updatingProfile.value = true
  try {
    const updatedUser = await $fetch('/api/auth/profile', {
      method: 'PATCH',
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      },
      body: profileForm.value
    })

    // Обновляем данные пользователя в store
    authStore.user = updatedUser as any
    toast.success('Профиль успешно обновлен')
  } catch (err: any) {
    toast.error(err.data?.message || 'Ошибка обновления профиля')
  } finally {
    updatingProfile.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('Пароли не совпадают')
    return
  }

  changingPassword.value = true
  try {
    await $fetch('/api/auth/change-password', {
      method: 'POST',
      baseURL: config.public.apiBaseUrl,
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      },
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      }
    })

    toast.success('Пароль успешно изменен')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  } catch (err: any) {
    toast.error(err.data?.message || 'Ошибка изменения пароля')
  } finally {
    changingPassword.value = false
  }
}

useHead({
  title: 'Редактирование профиля',
})

import { useCityStore } from '~/stores/city'

const cityStore = useCityStore()

watch(
  () => authStore.user?.city,
  (newCity) => {
    if (newCity && cityStore.code !== newCity) {
      cityStore.setCity(newCity)
    }
  },
  { immediate: true }
)
</script>
