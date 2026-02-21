<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const mobileNavOpen = ref(false)
const userLabel = computed(() => {
  const u = auth.user
  if (!u) return 'Гость'
  return u.name || u.email
})

const roleLabel = computed(() => {
  const r = auth.user?.role
  if (r === 'store') return 'Магазин'
  if (r === 'manager') return 'Менеджер'
  if (r === 'admin') return 'Админ'
  return 'Пользователь'
})

function logout() {
  auth.logout()
  return navigateTo('/login')
}

const nav = computed(() => {
  const role = auth.user?.role
  if (role === 'admin') {
    return [
      { to: '/b2b', label: 'Дэшборд', desc: 'Сводка', icon: '▦' },
      { to: '/b2b/admin/catalog', label: 'Каталог', desc: 'Категории и товары', icon: '🗂️' },
      { to: '/b2b/admin/orders', label: 'Все заказы', desc: 'Список', icon: '🧾' },
      { to: '/b2b/admin/in-work', label: 'В работе', desc: 'Сборка заказов', icon: '🛠️' },
      { to: '/b2b/admin/shipments', label: 'Отгрузки', desc: 'Подтверждение', icon: '🚚' },
      { to: '/b2b/admin/warehouse', label: 'Склад', desc: 'Остатки и движения', icon: '📦' },
      { to: '/b2b/admin/analytics', label: 'Аналитика', desc: 'Заказы, склад, отгрузки', icon: '📈' },
      { to: '/b2b/admin/settings', label: 'Настройки', desc: 'Операционные параметры', icon: '⚙️' },
    ]
  }
  if (role === 'manager') {
    return [
      { to: '/b2b', label: 'Дэшборд', desc: 'Сводка', icon: '▦' },
      { to: '/b2b/admin/orders', label: 'Все заказы', desc: 'Список', icon: '🧾' },
      { to: '/b2b/admin/in-work', label: 'В работе', desc: 'Сборка заказов', icon: '🛠️' },
      { to: '/b2b/admin/shipments', label: 'Отгрузки', desc: 'Подтверждение', icon: '🚚' },
    ]
  }
  // store
  return [
    { to: '/b2b', label: 'Дэшборд', desc: 'Главная', icon: '▦' },
    { to: '/catalog', label: 'Каталог', desc: 'Оптовый каталог', icon: '🛒' },
    { to: '/b2b/quick-order', label: 'Быстрый заказ', desc: 'По артикулам', icon: '⚡' },
    { to: '/b2b/orders', label: 'Мои заказы', desc: 'История', icon: '🧾' },
    { to: '/b2b/settings', label: 'Профиль', desc: 'Данные магазина', icon: '⚙️' },
  ]
})
</script>

<template>
  <div class="min-h-screen text-slate-900 bg-gray-50">
    <!-- topbar -->
    <!-- Keep B2B header above any content as well -->
    <header class="sticky top-0 z-[1000] border-b border-gray-200 bg-white/90 backdrop-blur">
      <div class="w-full px-4 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <button
            class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100"
            @click="mobileNavOpen = !mobileNavOpen"
            aria-label="Открыть меню"
          >
            <span class="text-lg">≡</span>
          </button>

          <NuxtLink to="/b2b" class="flex items-center gap-2">
            <span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-300/30 to-cyan-400/10 border border-gray-200 flex items-center justify-center">
              <span class="text-amber-700 font-semibold">B2B</span>
            </span>
            <div class="leading-tight">
              <div class="font-semibold text-sm">ДВ Сувенир</div>
              <div class="text-[11px] text-gray-500">кабинет магазинов</div>
            </div>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2">
          <NuxtLink
            to="/catalog"
            class="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
          >
            <span>←</span>
            <span>Каталог</span>
          </NuxtLink>

          <div class="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
            <div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs">{{ userLabel[0] || 'U' }}</div>
            <div class="leading-tight">
              <div class="text-xs font-medium truncate max-w-[180px]">{{ userLabel }}</div>
              <div class="text-[11px] text-gray-500 flex items-center gap-2">
                <span class="inline-flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full" :class="auth.user?.role === 'store' ? 'bg-emerald-400' : auth.user?.role === 'manager' ? 'bg-sky-400' : 'bg-slate-400'" />
                  {{ roleLabel }}
                </span>
                <button class="hover:text-amber-700" @click="logout">Выйти</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="w-full px-4 py-4 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-[calc(100vh-72px)] items-stretch">
      <!-- sidebar -->
      <aside class="md:sticky md:top-[72px] h-fit">
        <div
          class="md:block"
          :class="mobileNavOpen ? 'block' : 'hidden md:block'"
        >
          <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="p-4 border-b border-gray-200">
              <div class="text-xs text-gray-500">Навигация</div>
              <div class="text-sm font-semibold">B2B меню</div>
            </div>

            <nav class="p-2">
              <NuxtLink
                v-for="item in nav"
                :key="item.to"
                :to="item.to"
                class="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100"
                active-class="bg-gray-100 border border-gray-200"
                @click="mobileNavOpen = false"
              >
                <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                  <span class="text-lg">{{ item.icon }}</span>
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-medium">{{ item.label }}</div>
                  <div class="text-[11px] text-gray-500 truncate">{{ item.desc }}</div>
                </div>
              </NuxtLink>
            </nav>

            <div class="p-4 border-t border-gray-200">
              <div class="rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-3">
                <div class="text-xs text-gray-700 font-medium">Подсказка</div>
                <div class="text-[11px] text-gray-500 mt-1">
                  Платформа работает только в B2B-режиме: каталог, заказ, склад и отгрузки.
                </div>
              </div>
              <div class="md:hidden mt-3">
                <button class="w-full px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="logout">
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- content -->
      <main class="min-w-0 flex">
        <div class="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 flex-1 min-h-0 flex flex-col overflow-hidden">
          <div class="flex-1 min-h-0">
            <slot />
          </div>
        </div>
      </main>

      <ScrollToTop />
    </div>
  </div>
</template>
