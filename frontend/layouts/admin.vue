<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import AdminNavIcon from '~/components/admin/AdminNavIcon.vue'

const auth = useAuthStore()
auth.initFromStorage()

const mobileNavOpen = ref(false)

const userLabel = computed(() => {
  const u = auth.user
  if (!u) return 'Администратор'
  return u.name || u.email || 'Администратор'
})

function logout() {
  auth.logout()
  return navigateTo('/login')
}

const nav = computed(() => {
  const items = [
    { to: '/admin', label: 'Дэшборд', desc: 'Сводка', icon: 'dashboard', roles: ['manager', 'admin'] },
    { to: '/admin/catalog', label: 'Каталог', desc: 'Товары и категории', icon: 'catalog', roles: ['admin'] },
    { to: '/admin/orders', label: 'Заказы', desc: 'Список', icon: 'orders', roles: ['manager', 'admin'] },
    { to: '/admin/in-work', label: 'В работе', desc: 'Сборка', icon: 'inwork', roles: ['manager', 'admin'] },
    { to: '/admin/shipments', label: 'Отгрузки', desc: 'Контроль', icon: 'shipments', roles: ['manager', 'admin'] },
    { to: '/admin/warehouse', label: 'Склад', desc: 'Остатки и движения', icon: 'warehouse', roles: ['admin'] },
    { to: '/admin/stores', label: 'Магазины', desc: 'Партнёры', icon: 'stores', roles: ['manager', 'admin'] },
    { to: '/admin/analytics', label: 'Аналитика', desc: 'KPI и отчёты', icon: 'analytics', roles: ['admin'] },
    { to: '/admin/production', label: 'Производство', desc: 'Workorders', icon: 'production', roles: ['admin', 'manager', 'production'] },
  ]
  const r = auth.user?.role
  return items.filter((it) => (it.roles || []).includes(r || ''))
})
</script>

<template>
  <div class="min-h-screen text-slate-900 bg-gray-50">
    <header class="sticky top-0 z-[1000] border-b border-gray-200 bg-white">
      <div class="w-full px-4 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <button
            class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100"
            @click="mobileNavOpen = !mobileNavOpen"
            aria-label="Открыть меню"
          >
            <span class="text-lg">≡</span>
          </button>

          <NuxtLink to="/admin" class="flex items-center gap-2">
            <span class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold">A</span>
            <div class="leading-tight">
              <div class="font-semibold text-sm">ДВ Сувенир Admin</div>
              <div class="text-[11px] text-gray-500">операционная панель</div>
            </div>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2">
          <div class="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
            <div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs">{{ (userLabel?.[0] || 'A').toUpperCase() }}</div>
            <div class="text-xs font-medium truncate max-w-[180px]">{{ userLabel }}</div>
          </div>
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="logout">Выйти</button>
        </div>
      </div>
    </header>

    <div class="w-full px-4 py-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 min-h-[calc(100vh-72px)] items-stretch">
      <aside class="md:sticky md:top-[72px] h-fit">
        <div :class="mobileNavOpen ? 'block' : 'hidden md:block'">
          <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="p-4 border-b border-gray-100">
              <div class="text-xs text-gray-500">Навигация</div>
              <div class="text-sm font-semibold">Админ-панель</div>
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
                <AdminNavIcon :icon="item.icon" />
                <div class="min-w-0">
                  <div class="text-sm font-medium">{{ item.label }}</div>
                  <div class="text-[11px] text-gray-500 truncate">{{ item.desc }}</div>
                </div>
              </NuxtLink>
            </nav>
          </div>
        </div>
      </aside>

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
