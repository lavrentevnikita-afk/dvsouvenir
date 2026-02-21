<script setup lang="ts">
const { toasts, remove } = useToast()

const typeClasses = (t: any) => {
  switch (t?.type) {
    case 'success':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900'
    case 'error':
      return 'border-red-200 bg-red-50 text-red-900'
    default:
      return 'border-gray-200 bg-white text-slate-900'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed z-[70] right-3 top-3 space-y-2 w-[min(360px,calc(100vw-24px))]">
      <TransitionGroup name="toast" tag="div" class="space-y-2">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="rounded-2xl border p-3 shadow-sm backdrop-blur flex items-start gap-3"
          :class="typeClasses(t)"
        >
          <div class="min-w-0 flex-1">
            <div v-if="t.title" class="text-sm font-semibold leading-5">
              {{ t.title }}
            </div>
            <div class="text-sm leading-5 break-words">
              {{ t.message }}
            </div>
          </div>
          <button
            class="shrink-0 rounded-xl px-2 py-1 text-xs hover:bg-black/5"
            type="button"
            @click="remove(t.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.18s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
