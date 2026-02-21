<script setup lang="ts">
type FacetEnum = { type: 'enum'; values: { value: string; count: number }[] }
type FacetRange = { type: 'range'; min: number; max: number; step: number }
type Facet = FacetEnum | FacetRange

const props = defineProps<{
  facets: { specs?: Record<string, Facet> } | null
  priceMin: string | null
  priceMax: string | null
  inStock: boolean
  onlyMyCity: boolean
  cityName?: string | null
  selectedSpecs: Record<string, string[]>
  selectedRanges: Record<string, { min?: number; max?: number }>
}>()

const emit = defineEmits<{
  (e: 'update:priceMin', v: string | null): void
  (e: 'update:priceMax', v: string | null): void
  (e: 'update:inStock', v: boolean): void
  (e: 'update:onlyMyCity', v: boolean): void
  (e: 'update:selectedSpecs', v: Record<string, string[]>): void
  (e: 'update:selectedRanges', v: Record<string, { min?: number; max?: number }>): void
  (e: 'apply'): void
  (e: 'reset'): void
}>()

const specs = computed(() => props.facets?.specs ?? {})

function toggleEnum(key: string, val: string) {
  const next = { ...(props.selectedSpecs || {}) }
  const cur = Array.isArray(next[key]) ? [...next[key]] : []
  const idx = cur.indexOf(val)
  if (idx >= 0) cur.splice(idx, 1)
  else cur.push(val)
  if (cur.length) next[key] = cur
  else delete next[key]
  emit('update:selectedSpecs', next)
  emit('apply')
}

function setRange(key: string, patch: { min?: number; max?: number }) {
  const next = { ...(props.selectedRanges || {}) }
  const cur = { ...(next[key] || {}) }
  if (patch.min != null) cur.min = patch.min
  if (patch.max != null) cur.max = patch.max

  // normalize
  const facet = specs.value[key] as FacetRange | undefined
  if (facet && facet.type === 'range') {
    const baseMin = facet.min
    const baseMax = facet.max
    const min = typeof cur.min === 'number' ? cur.min : baseMin
    const max = typeof cur.max === 'number' ? cur.max : baseMax
    cur.min = Math.min(min, max)
    cur.max = Math.max(min, max)

    // if equals defaults — remove
    if (Math.abs(cur.min - baseMin) < 1e-9 && Math.abs(cur.max - baseMax) < 1e-9) {
      delete next[key]
      emit('update:selectedRanges', next)
      emit('apply')
      return
    }
  }

  next[key] = cur
  emit('update:selectedRanges', next)
}

function applyRangesNow() {
  emit('apply')
}

function isChecked(key: string, val: string) {
  return Array.isArray(props.selectedSpecs?.[key]) && props.selectedSpecs[key].includes(val)
}

function rangeValue(key: string, which: 'min' | 'max') {
  const f = specs.value[key] as FacetRange | undefined
  if (!f || f.type !== 'range') return 0
  const cur = props.selectedRanges?.[key]
  const v = which === 'min' ? cur?.min : cur?.max
  return typeof v === 'number' && Number.isFinite(v) ? v : (which === 'min' ? f.min : f.max)
}

const hasAnyFilters = computed(() => {
  const hasPrice = !!props.priceMin || !!props.priceMax
  const hasStock = !!props.inStock
  const hasCity = !!props.onlyMyCity
  const hasSpecs = Object.keys(props.selectedSpecs || {}).length > 0
  const hasRanges = Object.keys(props.selectedRanges || {}).length > 0
  return hasPrice || hasStock || hasCity || hasSpecs || hasRanges
})

function resetAll() {
  emit('update:priceMin', null)
  emit('update:priceMax', null)
  emit('update:inStock', false)
  emit('update:onlyMyCity', false)
  emit('update:selectedSpecs', {})
  emit('update:selectedRanges', {})
  emit('reset')
  emit('apply')
}
</script>

<template>
  <aside class="sticky top-20 space-y-3">
    <div class="rounded-xl border border-gray-200 bg-white p-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-900">Фильтры</h3>
        <button
          v-if="hasAnyFilters"
          type="button"
          class="text-xs text-gray-500 hover:text-gray-900"
          @click="resetAll"
        >
          Сбросить
        </button>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-gray-500">Цена от</label>
          <input
            :value="priceMin"
            type="number"
            min="0"
            class="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"
            @input="emit('update:priceMin', ($event.target as HTMLInputElement).value || null)"
            @change="emit('apply')"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] text-gray-500">Цена до</label>
          <input
            :value="priceMax"
            type="number"
            min="0"
            class="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"
            @input="emit('update:priceMax', ($event.target as HTMLInputElement).value || null)"
            @change="emit('apply')"
          />
        </div>
      </div>

      <div class="mt-3 space-y-2">
        <label class="inline-flex items-center gap-2 text-xs text-gray-700">
          <input
            :checked="inStock"
            type="checkbox"
            class="h-6 w-6 rounded border-gray-300 text-slate-900"
            @change="emit('update:inStock', !!($event.target as HTMLInputElement).checked); emit('apply')"
          />
          Только в наличии
        </label>

        <label class="inline-flex items-center gap-2 text-xs text-gray-700">
          <input
            :checked="onlyMyCity"
            type="checkbox"
            class="h-6 w-6 rounded border-gray-300 text-slate-900"
            @change="emit('update:onlyMyCity', !!($event.target as HTMLInputElement).checked); emit('apply')"
          />
          Только мой город
          <span v-if="onlyMyCity && cityName" class="text-gray-400">({{ cityName }})</span>
        </label>
      </div>
    </div>

    <div v-if="Object.keys(specs).length" class="space-y-3">
      <details
        v-for="(facet, key) in specs"
        :key="key"
        open
        class="rounded-xl border border-gray-200 bg-white"
      >
        <summary class="cursor-pointer select-none px-3 py-2 text-sm font-medium text-gray-900">
          {{ key }}
        </summary>

        <div class="px-3 pb-3">
          <!-- enum -->
          <div v-if="facet.type === 'enum'" class="max-h-56 overflow-auto space-y-2">
            <label
              v-for="opt in (facet as any).values"
              :key="opt.value"
              class="flex items-center justify-between gap-3 text-xs text-gray-700"
            >
              <span class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  class="h-6 w-6 rounded border-gray-300 text-slate-900"
                  :checked="isChecked(key, opt.value)"
                  @change="toggleEnum(key, opt.value)"
                />
                <span class="line-clamp-1">{{ opt.value }}</span>
              </span>
              <span class="text-[11px] text-gray-400">{{ opt.count }}</span>
            </label>
          </div>

          <!-- range -->
          <div v-else class="space-y-3">
            <div class="grid grid-cols-2 gap-2">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] text-gray-500">От</label>
                <input
                  type="number"
                  :step="(facet as any).step"
                  class="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"
                  :value="rangeValue(key, 'min')"
                  @input="setRange(key, { min: Number(($event.target as HTMLInputElement).value) })"
                  @change="applyRangesNow"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[11px] text-gray-500">До</label>
                <input
                  type="number"
                  :step="(facet as any).step"
                  class="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"
                  :value="rangeValue(key, 'max')"
                  @input="setRange(key, { max: Number(($event.target as HTMLInputElement).value) })"
                  @change="applyRangesNow"
                />
              </div>
            </div>

            <div class="relative h-8">
              <input
                type="range"
                class="absolute inset-0 w-full"
                :min="(facet as any).min"
                :max="(facet as any).max"
                :step="(facet as any).step"
                :value="rangeValue(key, 'min')"
                @input="setRange(key, { min: Number(($event.target as HTMLInputElement).value) })"
                @change="applyRangesNow"
              />
              <input
                type="range"
                class="absolute inset-0 w-full"
                :min="(facet as any).min"
                :max="(facet as any).max"
                :step="(facet as any).step"
                :value="rangeValue(key, 'max')"
                @input="setRange(key, { max: Number(($event.target as HTMLInputElement).value) })"
                @change="applyRangesNow"
              />
            </div>

            <p class="text-[11px] text-gray-500">
              Диапазон: {{ (facet as any).min }} — {{ (facet as any).max }}
            </p>
          </div>
        </div>
      </details>
    </div>
  </aside>
</template>
