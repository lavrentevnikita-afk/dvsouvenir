
<template>
  <NuxtLayout>
    <Suspense>
      <template #default>
        <NuxtPage />
      </template>
      <template #fallback>
        <div class="flex items-center justify-center min-h-screen">
          <span class="text-lg text-gray-400 animate-pulse">Загрузка...</span>
        </div>
      </template>
    </Suspense>
  </NuxtLayout>
</template>
