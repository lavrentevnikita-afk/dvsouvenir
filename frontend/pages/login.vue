<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const router = useRouter()
const authStore = useAuthStore()

const onSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // логинимся через Pinia-store (он сам сходит на /api/auth/login)
    await authStore.login(email.value, password.value)

    // Определим роль и отправим пользователя в правильный кабинет
    try {
      await authStore.fetchMe()
    } catch {
      // если не удалось подтянуть профиль — пусть уйдёт в /account (там разрулим)
    }

    const role = authStore.user?.role
    if (role === 'admin') {
      await router.push('/admin')
      return
    }
    if (role === 'store') {
      await router.push('/')
      return
    }
    if (role === 'manager') {
      await router.push('/admin')
      return
    }

    if (role === 'production') {
      await router.push('/production')
      return
    }

    // после успешного входа — в личный кабинет
    await router.push('/account')
  } catch (err: any) {
    console.error(err)
    errorMessage.value =
      err?.data?.message || 'Неверный email или пароль.'
  } finally {
    loading.value = false
  }
}
</script>


<template>
  <section class="max-w-md mx-auto mt-8 bg-white rounded-card shadow-sm p-6">
    <h1 class="text-xl font-semibold mb-4">Вход для покупателей</h1>

    <p class="text-sm text-slate-500 mb-4">
      Войдите в личный кабинет, чтобы просматривать заказы и быстрее
      оформлять покупки.
    </p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <BaseInput
        v-model="email"
        type="email"
        label="Email"
        :required="true"
      />

      <BaseInput
        v-model="password"
        type="password"
        label="Пароль"
        :required="true"
      />

      <div class="text-right">
        <NuxtLink to="/forgot-password" class="text-sm text-primary hover:text-primary-dark transition-colors">
          Забыли пароль?
        </NuxtLink>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <BaseButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="loading"
        :disabled="loading"
        full-width
      >
        {{ loading ? 'Входим...' : 'Войти' }}
      </BaseButton>
    </form>

    <p class="text-sm text-slate-500 mt-4">
      Нет аккаунта?
      <NuxtLink to="/register" class="text-primary font-medium hover:text-primary-dark transition-colors">
        Зарегистрироваться
      </NuxtLink>
    </p>

  </section>
</template>
