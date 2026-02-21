<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const storeId = route.params.id
</script>

<template>
	<section class="max-w-3xl mx-auto mt-8 bg-white rounded-card shadow-sm p-6">
		<h1 class="text-xl font-semibold mb-4">Магазин #{{ storeId }}</h1>
		<p class="text-sm text-slate-500 mb-4">Детальная информация о магазине.</p>
		<!-- Здесь можно добавить детали магазина, заказы, контакты и т.д. -->
	</section>
</template>
