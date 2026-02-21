<script setup lang="ts">
import PromoCarousel from '~/components/PromoCarousel.vue'
import HomeCategoriesMega from '~/components/HomeCategoriesMega.vue'
import HomePersonalizedProducts from '~/components/HomePersonalizedProducts.vue'
import HomeCategoryProducts from '~/components/HomeCategoryProducts.vue'

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNuxtData, useAsyncData, useRuntimeConfig } from '#app'

const auth = useAuthStore()
auth.initFromStorage()

const { data: headerCategories } = useNuxtData<any>('header-categories')
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiBaseUrl : config.public.apiBaseUrl

const { data: fallbackCategories } = await useAsyncData('fallback-categories', () =>
  $fetch('/api/catalog/categories', { baseURL: apiBaseUrl })
)

const categoriesTree = computed(() => {
  if (headerCategories.value?.categories?.length) return headerCategories.value.categories
  if (fallbackCategories.value?.categories?.length) return fallbackCategories.value.categories
  return []
})

function flattenCategories(tree: any[]): any[] {
  const out: any[] = []
  const stack = Array.isArray(tree) ? [...tree] : []
  while (stack.length) {
    const n = stack.shift()
    if (!n) continue
    out.push(n)
    if (Array.isArray(n.children) && n.children.length) stack.push(...n.children)
  }
  return out
}

const featuredCategories = computed(() => {
  const flat = flattenCategories(categoriesTree.value)
  return flat
    .filter((c) => c?.slug && String(c.slug).trim() && Number(c.productsCount || 0) > 0)
    .sort((a, b) => Number(b.productsCount || 0) - Number(a.productsCount || 0))
    .slice(0, 3)
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name }))
})
</script>

<template>
  <div class="space-y-6">
    <div class="bg-yellow-100 border border-yellow-300 rounded p-4 mb-4 text-yellow-900 text-sm">
      <strong>Внимание!</strong> Это ранний тест сайта. Функционал может работать нестабильно.<br>
      Для обратной связи: <b>+7 964 825-99-46</b> или Telegram <b>@insider_mngr</b>
    </div>
    <!-- Промобаннеры показываем ТОЛЬКО на главной -->
    <PromoCarousel />

    <!-- Блок категорий: слева родители, справа подкатегории -->
    <HomeCategoriesMega :categories="categoriesTree" />

    <!-- Персонализированный блок: показывает товары из категорий, которые пользователь смотрел ранее -->
    <HomePersonalizedProducts />

    <!-- 3 блока по категориям (автоподбор по наполнению) -->
    <HomeCategoryProducts
      v-for="c in featuredCategories"
      :key="c.slug"
      :category="c"
      :limit="12"
    />

    <!-- Footer -->
    <footer class="mt-12 border-t border-slate-200 pt-8 pb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Бренд -->
        <div class="md:col-span-1">
          <div class="text-lg font-bold text-slate-900 mb-2">Дальневосточный Сувенир</div>
          <p class="text-sm text-slate-500 leading-relaxed">
            B2B-каталог для партнерских магазинов: быстрое оформление заказов и операционная прозрачность.
          </p>
        </div>

        <!-- Навигация -->
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Разделы</div>
          <ul class="space-y-2 text-sm">
            <li><NuxtLink to="/catalog" class="text-slate-600 hover:text-slate-900 transition-colors">Каталог</NuxtLink></li>
            <li><NuxtLink to="/cart" class="text-slate-600 hover:text-slate-900 transition-colors">Корзина</NuxtLink></li>
            <li><NuxtLink to="/account/orders" class="text-slate-600 hover:text-slate-900 transition-colors">История заказов</NuxtLink></li>
          </ul>
        </div>


        <!-- Контакты -->
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Контакты</div>
          <ul class="space-y-2 text-sm text-slate-600">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:info@suvlavka.ru" class="hover:text-slate-900 transition-colors">info@suvlavka.ru</a>
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:+78001234567" class="hover:text-slate-900 transition-colors">8 800 123-45-67</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Копирайт -->
      <div class="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="text-xs text-slate-400">
          © {{ new Date().getFullYear() }} Дальневосточный Сувенир. Все права защищены.
        </p>
        <!-- Ссылки на privacy и terms убраны -->
      </div>
    </footer>
  </div>
</template>
