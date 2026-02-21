<script setup lang="ts">
const props = defineProps<{ itemsCount: number; subtotal: number }>()

// Доставка и оплата полностью убраны
const total = computed(() => props.subtotal)
</script>

<template>
  <aside class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold">Резюме</h2>
      <span class="text-[11px] text-gray-500">{{ itemsCount }} шт.</span>
    </div>


    <!-- Блоки доставки и оплаты убраны -->

    <div class="space-y-2 border-t border-gray-100 pt-3">
      <div class="flex justify-between text-xs text-gray-600">
        <span>Товары</span>
        <span>{{ subtotal }} ₽</span>
      </div>
      <!-- Доставка убрана -->
      <div class="flex justify-between text-base font-semibold">
        <span>Итого</span>
        <span>{{ total }} ₽</span>
      </div>
      <!-- Выбор доставки и оплаты убран -->
    </div>

    <slot />
  </aside>
</template>
