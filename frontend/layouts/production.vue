<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
auth.initFromStorage()

const mobileNavOpen = ref(false)

const userLabel = computed(() => {
  const u = auth.user
  if (!u) return 'Производство'
  return u.name || u.email || 'Производство'
})

function logout() {
  auth.logout()
  return navigateTo('/login')
}

const nav = [
  { to: '/production', label: 'Очередь', desc: 'Заказы в работе', icon: '🧑‍🏭' },
]
</script>

<template>
  <div class="min-h-screen text-slate-900 bg-gray-50">
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

          <NuxtLink to="/production" class="flex items-center gap-2">
            <span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-slate-900/0 border border-gray-200 flex items-center justify-center">
              <span class="text-emerald-700 font-semibold">P</span>
            </span>
            <div class="leading-tight">
              <div class="font-semibold text-sm">ДВ Сувенир / Производство</div>
              <div class="text-[11px] text-gray-500">очередь сборки</div>
            </div>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2">
          <div class="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
            <div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs">
              {{ (userLabel?.[0] || 'P').toUpperCase() }}
            </div>
            <div class="leading-tight">
              <div class="text-xs font-medium truncate max-w-[180px]">{{ userLabel }}</div>
              <div class="text-[11px] text-gray-500">Производство</div>
            </div>
          </div>

          <button
            class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
            @click="logout"
          >
            <span>🚪</span>
            <span class="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </header>

    <div class="w-full px-4 py-4 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-[calc(100vh-72px)] items-stretch">
      <aside class="md:sticky md:top-[72px] h-fit">
        <div :class="mobileNavOpen ? 'block' : 'hidden md:block'">
          <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="p-4 border-b border-gray-200">
              <div class="text-xs text-gray-500">Навигация</div>
              <div class="text-sm font-semibold">Production</div>
            </div>
            <nav class="p-2">
              <NuxtLink
                v-for="it in nav"
                :key="it.to"
                :to="it.to"
                class="block rounded-xl p-3 hover:bg-gray-50 border border-transparent"
                active-class="bg-gray-50 border-gray-200"
              >
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm">{{ it.icon }}</div>
                  <div class="leading-tight">
                    <div class="text-sm font-medium">{{ it.label }}</div>
                    <div class="text-[11px] text-gray-500">{{ it.desc }}</div>
                  </div>
                </div>
              </NuxtLink>
            </nav>
          </div>
        </div>
      </aside>

      <main>
        <NuxtPage />
      </main>
    </div>
  </div>
</template>
