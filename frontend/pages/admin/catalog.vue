<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

definePageMeta({ layout: 'admin', middleware: ['admin'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const tab = ref<'categories' | 'products' | 'cities'>('products')

const loading = ref(false)
const error = ref<string | null>(null)

const { push: toast } = useToast()

const categories = ref<any[]>([])
const products = ref<any[]>([])
const productImages = ref<any[]>([])
const warehouses = ref<Array<{ code: string; name: string; regionCode?: string }>>([])
const cities = ref<Array<{ code: string; name: string; regionCode?: string }>>([])

const cityForm = ref<{ code: string; regionCode: string; name: string }>({ code: '', regionCode: '', name: '' })

const q = ref('')
const categoryId = ref<number | ''>('')
const issueFilter = ref<string>('')
const cityFilter = ref<string>('')
const kindFilter = ref<string>('')
const showArchived = ref(false)

// forms
const catForm = ref<{ id?: number; slug: string; name: string; description?: string; imageUrl?: string; parentId?: number | null; sortOrder?: number; isActive?: boolean }>(
  { slug: '', name: '', description: '', imageUrl: '', parentId: null, sortOrder: 0, isActive: true },
)

const roots = computed(() => categories.value.filter((c) => !c.parent))

const categoryOptions = computed(() => {
  // For products: prefer subcategories, but keep root categories available for legacy data.
  const byParent: Record<string, any[]> = {}
  for (const c of categories.value) {
    const pid = c.parent?.id ? String(c.parent.id) : 'root'
    byParent[pid] = byParent[pid] || []
    byParent[pid].push(c)
  }
  const out: Array<{ id: number; name: string; level: 0 | 1; isRoot: boolean }> = []
  const rootsSorted = [...(byParent['root'] || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.name).localeCompare(String(b.name)))
  for (const r of rootsSorted) {
    out.push({ id: r.id, name: r.name, level: 0, isRoot: true })
    const kids = [...(byParent[String(r.id)] || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.name).localeCompare(String(b.name)))
    for (const k of kids) {
      out.push({ id: k.id, name: k.name, level: 1, isRoot: false })
    }
  }
  return out
})

const categoryById = computed<Record<number, any>>(() => {
  const map: any = {}
  for (const c of categories.value) map[c.id] = c
  return map
})

const productForm = ref<any>({
  id: undefined,
  slug: '',
  name: '',
  article: '',
  price: '0.00',
  weight: '',
  categoryId: '',
  city: '',
  isAvailable: true,
  isActive: true,
  kind: 'finished',
  description: '',
})

const showProductModal = ref(false)
const showCloneModal = ref(false)
const cloneSourceProduct = ref<any>(null)

const cloneFields = ref<Record<string, boolean>>({
  name: true,
  price: true,
  weight: true,
  city: true,
  categoryId: true,
  isAvailable: true,
  kind: true,
  description: true,
  specs: true,
})
const cloneIncludeImages = ref(true)
const createMoreInModal = ref(false)

// modal tabs
const productModalTab = ref<'edit' | 'history'>('edit')

// preview modal (client template)
const showPreviewModal = ref(false)

// history
const historyLoading = ref(false)
const historyError = ref<string | null>(null)
const productHistory = ref<any[]>([])

// BOM (production recipe)
const bomLoading = ref(false)
const bomError = ref<string | null>(null)
const bomItems = ref<Array<{ componentProductId: number; qty: number }>>([])
const blanksLoading = ref(false)
const blanksQ = ref('')
const blankProducts = ref<any[]>([])

// ----------------------
// Inline editing in products table
// ----------------------
type EditableField = 'price' | 'categoryId' | 'isActive' | 'isAvailable'

const editingCell = ref<{ id: number; field: EditableField } | null>(null)
const editingValue = ref<any>('')
const editingOriginal = ref<any>(null)
const editingSaving = ref(false)
const ignoreNextBlur = ref(false)
const changedCells = ref<Record<string, boolean>>({})

function recomputeIssues(p: any) {
  const issues: string[] = []
  const priceNum = Number(p?.price)
  if (!p?.price || Number.isNaN(priceNum) || priceNum <= 0) issues.push('no_price')
  if (!p?.images || !Array.isArray(p.images) || p.images.length === 0) issues.push('no_image')
  if (!p?.category || !p?.category?.id) issues.push('no_category')
  p.issues = issues
}

function cellKey(id: number, field: EditableField) {
  return `${id}:${field}`
}

function markChanged(id: number, field: EditableField) {
  const key = cellKey(id, field)
  changedCells.value[key] = true
  if (process.client) {
    window.setTimeout(() => {
      const next = { ...changedCells.value }
      delete next[key]
      changedCells.value = next
    }, 900)
  }
}

function startEdit(p: any, field: EditableField) {
  if (!p?.id) return
  if (editingSaving.value) return

  editingCell.value = { id: p.id, field }

  if (field === 'price') {
    editingOriginal.value = String(p.price ?? '')
    editingValue.value = String(p.price ?? '')
  } else if (field === 'categoryId') {
    editingOriginal.value = p.category?.id ?? ''
    editingValue.value = p.category?.id ?? ''
  } else if (field === 'isActive') {
    editingOriginal.value = p.isActive !== false
    editingValue.value = p.isActive !== false
  } else if (field === 'isAvailable') {
    editingOriginal.value = !!p.isAvailable
    editingValue.value = !!p.isAvailable
  }
}

function cancelEdit() {
  editingCell.value = null
  editingValue.value = ''
  editingOriginal.value = null
}

function productById(id: number) {
  return products.value.find((x: any) => x.id === id)
}

async function patchProductInline(id: number, field: EditableField, value: any) {
  if (!auth.accessToken) return
  const p = productById(id)
  if (!p) return

  const original = editingOriginal.value
  const hasChanged = String(value) !== String(original)
  if (!hasChanged) {
    cancelEdit()
    return
  }

  const payload: any = {}
  if (field === 'price') payload.price = String(value).trim()
  if (field === 'categoryId') payload.categoryId = Number(value)
  if (field === 'isActive') payload.isActive = value === true
  if (field === 'isAvailable') payload.isAvailable = value === true

  editingSaving.value = true
  try {
    await $fetch<any>(`/api/admin/catalog/products/${id}`, {
      baseURL: apiBaseUrl,
      method: 'PATCH',
      headers: authHeaders(),
      body: payload,
    })

    // optimistic local update (keep list context)
    if (field === 'price') p.price = payload.price
    if (field === 'categoryId') {
      const c = categoryById.value?.[payload.categoryId]
      p.category = c ? { id: c.id, name: c.name, slug: c.slug } : null
    }
    if (field === 'isActive') p.isActive = payload.isActive
    if (field === 'isAvailable') p.isAvailable = payload.isAvailable

    recomputeIssues(p)

    markChanged(id, field)
    toast({ type: 'success', message: 'Сохранено' })
    cancelEdit()
  } catch (e: any) {
    // rollback UI to original and show toast
    toast({ type: 'error', message: e?.data?.message || 'Не удалось сохранить' })
    // ensure the cell shows original value when exiting edit mode
    if (field === 'price') p.price = String(original ?? p.price)
    if (field === 'categoryId') {
      const c = categoryById.value?.[Number(original)]
      p.category = c ? { id: c.id, name: c.name, slug: c.slug } : p.category
    }
    if (field === 'isActive') p.isActive = original === true
    if (field === 'isAvailable') p.isAvailable = original === true
    recomputeIssues(p)
    cancelEdit()
  } finally {
    editingSaving.value = false
  }
}

function saveEditClick() {
  if (!editingCell.value) return
  ignoreNextBlur.value = true
  patchProductInline(editingCell.value.id, editingCell.value.field, editingValue.value)
  if (process.client) window.setTimeout(() => (ignoreNextBlur.value = false), 50)
}

function cancelEditClick() {
  ignoreNextBlur.value = true
  cancelEdit()
  if (process.client) window.setTimeout(() => (ignoreNextBlur.value = false), 50)
}

function onEditBlur() {
  if (ignoreNextBlur.value) return
  if (!editingCell.value) return
  patchProductInline(editingCell.value.id, editingCell.value.field, editingValue.value)
}

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    saveEditClick()
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelEditClick()
  }
}

// ----------------------
// Product specs schema (stored in Product.specs JSON)
// Заполняем максимально приближенно к примеру со скринов.
// ----------------------
type SpecField = {
  key: string
  label: string
  group: string
  placeholder?: string
  type?: 'text' | 'select'
  options?: string[]
}

const SPEC_FIELDS: SpecField[] = [
  // Особенности
  { group: 'Особенности', key: 'Набор', label: 'Набор', type: 'select', options: ['Да', 'Нет'] },
  { group: 'Особенности', key: 'Цвет', label: 'Цвет', placeholder: 'например: Серый' },
  { group: 'Особенности', key: 'Объём, л', label: 'Объём, л', placeholder: 'например: 0.43' },
  { group: 'Особенности', key: 'Объём, мл', label: 'Объём, мл', placeholder: 'например: 430' },
  { group: 'Особенности', key: 'Вид упаковки', label: 'Вид упаковки', placeholder: 'например: Пакет' },
  { group: 'Особенности', key: 'Рисунок', label: 'Рисунок', type: 'select', options: ['Да', 'Нет'] },
  { group: 'Особенности', key: 'Крышка', label: 'Крышка', type: 'select', options: ['Да', 'Нет'] },
  { group: 'Особенности', key: 'Материал крышки', label: 'Материал крышки', placeholder: 'например: Жесть / Дерево' },
  { group: 'Особенности', key: 'Материал', label: 'Материал', placeholder: 'например: Жесть' },
  { group: 'Особенности', key: 'Герметичная крышка', label: 'Герметичная крышка', type: 'select', options: ['Да', 'Нет'] },
  { group: 'Особенности', key: 'Для детей до 3 лет', label: 'Для детей до 3 лет', type: 'select', options: ['Да', 'Нет'] },
  { group: 'Особенности', key: 'Можно мыть в посудомоечной машине', label: 'Можно мыть в посудомоечной машине', type: 'select', options: ['Да', 'Нет'] },
  { group: 'Особенности', key: 'Можно использовать в СВЧ-печи', label: 'Можно использовать в СВЧ-печи', type: 'select', options: ['Да', 'Нет'] },
  { group: 'Особенности', key: 'Текстура', label: 'Текстура', placeholder: 'например: С рельефом' },
  { group: 'Особенности', key: 'Назначение', label: 'Назначение', placeholder: 'например: Для сыпучих' },
  { group: 'Особенности', key: 'Особенности товара', label: 'Особенности', placeholder: 'например: Без особенностей' },

  // Габариты и вес
  { group: 'Габариты и вес', key: 'Размер (Д × Ш × В, см)', label: 'Размер (Д × Ш × В, см)', placeholder: 'например: 11,5 × 11,5 × 7,3' },
  { group: 'Габариты и вес', key: 'Вес брутто, г', label: 'Вес брутто, г', placeholder: 'например: 75' },

  // Упаковка и фасовка
  { group: 'Упаковка и фасовка', key: 'В боксе', label: 'В боксе', placeholder: 'например: 96 шт' },
  { group: 'Упаковка и фасовка', key: 'Фасовка', label: 'Фасовка', placeholder: 'например: по 1 шт.' },
  { group: 'Упаковка и фасовка', key: 'Индивидуальная упаковка', label: 'Индивидуальная упаковка', placeholder: 'например: Пакет' },
  { group: 'Упаковка и фасовка', key: 'Размер упаковки (Д × Ш × В, см)', label: 'Размер упаковки (Д × Ш × В, см)', placeholder: 'например: 11,5 × 7,3 × 7,3' },

  // Общие
  { group: 'Общие', key: 'Сертификат', label: 'Сертификат', placeholder: 'например: Не подлежит сертификации' },
  { group: 'Общие', key: 'Страна производитель', label: 'Страна производитель', placeholder: 'например: Китай' },
  { group: 'Общие', key: 'Состав', label: 'Состав', placeholder: 'например: Жесть' },
  { group: 'Общие', key: 'Серия', label: 'Серия', placeholder: 'например: Посуда из жести "Ромб"' },
]

const specForm = ref<Record<string, string>>({})

function resetSpecForm() {
  const next: Record<string, string> = {}
  for (const f of SPEC_FIELDS) next[f.key] = ''
  specForm.value = next
}

const fileUploading = ref<Record<number, boolean>>({})

async function uploadCategoryImage(e: Event) {
  if (!auth.accessToken) return
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return
  error.value = null
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<any>('/api/admin/media/upload', {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: authHeaders(),
      query: { folder: 'categories' },
      body: fd,
    })
    if (res?.url) catForm.value.imageUrl = String(res.url)
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить картинку категории'
  } finally {
    // allow re-upload same file
    if (input) input.value = ''
  }
}

// автогенерация артикула (preview next-article)
const lastAutoArticle = ref<string>('')
const lastAutoKind = ref<'blank' | 'finished' | ''>('')

async function fetchAutoArticle(city?: string | null) {
  if (!auth.accessToken) return
  // только при создании нового товара
  if (productForm.value.id) return

  // если пользователь уже руками поменял артикул — не трогаем
  const currentArticle = String(productForm.value.article || '').trim()
  if (currentArticle && currentArticle !== lastAutoArticle.value) return

  try {
    const cityCode = String(city || '').trim().toUpperCase()
    const res = await $fetch<any>('/api/admin/catalog/next-article', {
      baseURL: apiBaseUrl,
      headers: authHeaders(),
      // city optional: если не выбран — всё равно дадим "00-xxxx"
      query: cityCode ? { city: cityCode } : undefined,
    })
    if (res?.article) {
      productForm.value.article = String(res.article)
      lastAutoArticle.value = String(res.article)
    }
  } catch {
    // молча — чтобы не мешать ручному вводу
  }
}

watch(
  () => productForm.value.city,
  async (city) => {
    await fetchAutoArticle(city)
  },
)

// Автовыбор типа товара по категории (чтобы "Заготовки" не превращались в finished)
watch(
  () => productForm.value.categoryId,
  (cid) => {
    // только при создании нового товара
    if (productForm.value.id) return
    const currentKind = (productForm.value.kind === 'blank' || productForm.value.kind === 'finished') ? productForm.value.kind : 'finished'
    // если пользователь уже явно выбрал тип — не трогаем
    if (lastAutoKind.value && currentKind !== lastAutoKind.value) return
    const cat = categories.value.find((c: any) => Number(c?.id) === Number(cid))
    const name = String(cat?.name || '').toLowerCase()
    const nextKind: 'blank' | 'finished' = name.includes('заготов') ? 'blank' : 'finished'
    productForm.value.kind = nextKind
    lastAutoKind.value = nextKind
  },
)

function authHeaders() {
  return auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {}
}

async function loadCategories() {
  if (!auth.accessToken) return
  const res = await $fetch<any>('/api/admin/catalog/categories', {
    baseURL: apiBaseUrl,
    headers: authHeaders(),
  })
  categories.value = Array.isArray(res?.categories) ? res.categories : []
}

async function loadProducts() {
  if (!auth.accessToken) return
  loading.value = true
  error.value = null
  try {
    const res = await $fetch<any>('/api/admin/catalog/products', {
      baseURL: apiBaseUrl,
      headers: authHeaders(),
      query: {
        q: q.value || undefined,
        categoryId: categoryId.value === '' ? undefined : categoryId.value,
        issue: issueFilter.value || undefined,
        city: cityFilter.value || undefined,
        kind: kindFilter.value || undefined,
        showArchived: showArchived.value ? 'true' : undefined,
        limit: 100,
      },
    })
    products.value = Array.isArray(res?.products) ? res.products : []
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить каталог'
  } finally {
    loading.value = false
  }
}

async function loadProductHistory(productId: number) {
  if (!auth.accessToken) return
  historyLoading.value = true
  historyError.value = null
  try {
    const res = await $fetch<any>(`/api/admin/catalog/products/${productId}/history`, {
      baseURL: apiBaseUrl,
      headers: authHeaders(),
    })
    productHistory.value = Array.isArray(res?.events) ? res.events : []
  } catch (e: any) {
    historyError.value = e?.data?.message || 'Не удалось загрузить историю'
    productHistory.value = []
  } finally {
    historyLoading.value = false
  }
}

function issuesOf(p: any): string[] {
  return Array.isArray(p?.issues) ? p.issues : []
}

function hasIssue(p: any, issue: string) {
  return issuesOf(p).includes(issue)
}

async function reloadAll() {
  loading.value = true
  error.value = null
  try {
    await loadCategories()
    await loadProducts()
    await loadWarehouses()
    await loadCities()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить данные'
  } finally {
    loading.value = false
  }
}

async function loadCities() {
  if (!auth.accessToken) return
  try {
    const res = await $fetch<any>('/api/ops/cities', {
      baseURL: apiBaseUrl,
      headers: authHeaders(),
    })
    cities.value = Array.isArray(res?.cities) ? res.cities : []
  } catch {
    cities.value = []
  }
}

async function loadWarehouses() {
  if (!auth.accessToken) return
  try {
    const res = await $fetch<any>('/api/ops/warehouses', {
      baseURL: apiBaseUrl,
      headers: authHeaders(),
    })
    warehouses.value = Array.isArray(res?.warehouses) ? res.warehouses : []
  } catch {
    warehouses.value = []
  }
}

async function saveCity() {
  if (!auth.accessToken) return
  error.value = null
  const payload = {
    code: String(cityForm.value.code || '').trim().toUpperCase(),
    regionCode: String(cityForm.value.regionCode || '').trim(),
    name: String(cityForm.value.name || '').trim(),
  }
  if (!payload.code) {
    error.value = 'Укажите код города'
    return
  }
  try {
    const res = await $fetch<any>('/api/ops/cities', {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: authHeaders(),
      body: payload,
    })
    if (res?.ok === false) {
      error.value = res?.message || 'Не удалось сохранить город'
    }
    cityForm.value = { code: '', regionCode: '', name: '' }
    await loadCities()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить город'
  }
}

async function deleteCity(code: string) {
  if (!auth.accessToken) return
  if (!confirm(`Удалить город ${code}?`)) return
  error.value = null
  try {
    const res = await $fetch<any>(`/api/ops/cities/${encodeURIComponent(code)}`, {
      baseURL: apiBaseUrl,
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (res?.ok === false) {
      error.value = res?.message || 'Нельзя удалить город'
      return
    }
    await loadCities()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось удалить город'
  }
}

function resetCatForm() {
  catForm.value = { slug: '', name: '', description: '', imageUrl: '', parentId: null, sortOrder: 0, isActive: true }
}

function editCategory(c: any) {
  catForm.value = {
    id: c.id,
    slug: String(c.slug || ''),
    name: String(c.name || ''),
    description: c.description ? String(c.description) : '',
    imageUrl: c.imageUrl ? String(c.imageUrl) : '',
    parentId: c.parent?.id ?? null,
    sortOrder: Number(c.sortOrder ?? 0),
    isActive: c.isActive !== false,
  }
  tab.value = 'categories'
}

async function saveCategory() {
  if (!auth.accessToken) return
  error.value = null
  const payload: any = {
    slug: String(catForm.value.slug || '').trim(),
    name: String(catForm.value.name || '').trim(),
    description: String(catForm.value.description || '').trim() || undefined,
    imageUrl: String(catForm.value.imageUrl || '').trim() || undefined,
    parentId: catForm.value.parentId ?? null,
    sortOrder: Number(catForm.value.sortOrder ?? 0) || 0,
    isActive: catForm.value.isActive !== false,
  }
  try {
    if (catForm.value.id) {
      await $fetch<any>(`/api/admin/catalog/categories/${catForm.value.id}`, {
        baseURL: apiBaseUrl,
        method: 'PATCH',
        headers: authHeaders(),
        body: payload,
      })
    } else {
      await $fetch<any>('/api/admin/catalog/categories', {
        baseURL: apiBaseUrl,
        method: 'POST',
        headers: authHeaders(),
        body: payload,
      })
    }
    resetCatForm()
    await loadCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить категорию'
  }
}

async function deleteCategory(id: number) {
  if (!auth.accessToken) return
  if (!confirm('Удалить категорию?')) return
  error.value = null
  try {
    const res = await $fetch<any>(`/api/admin/catalog/categories/${id}`, {
      baseURL: apiBaseUrl,
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (res?.ok === false) {
      error.value = res?.message || 'Нельзя удалить категорию'
      return
    }
    await loadCategories()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось удалить категорию'
  }
}

function resetProductForm() {
  lastAutoArticle.value = ''
  productImages.value = []
  productForm.value = {
    id: undefined,
    slug: '',
    name: '',
    article: '',
    price: '0.00',
    weight: '',
    categoryId: categories.value?.[0]?.id || '',
    city: '',
    isAvailable: true,
    isActive: true,
    kind: 'finished',
    description: '',
  }
  resetSpecForm()

  // reset BOM state
  bomItems.value = []
  bomError.value = null
}

function openNewProductModal() {
  resetProductForm()
  createMoreInModal.value = false
  showProductModal.value = true
  // если город ещё не выбран — всё равно подставим 00-xxxx
  // (и чтобы артикул появлялся сразу после открытия модалки)
  fetchAutoArticle(productForm.value.city)
}

function editProduct(p: any) {
  productImages.value = Array.isArray(p?.images) ? p.images : []
  productForm.value = {
    id: p.id,
    slug: String(p.slug || ''),
    name: String(p.name || ''),
    article: String(p.article || ''),
    price: String(p.price || '0.00'),
    weight: (p.weight === null || p.weight === undefined) ? '' : String(p.weight),
    categoryId: p.category?.id || '',
    city: p.city ? String(p.city) : '',
    isAvailable: !!p.isAvailable,
    isActive: p.isActive !== false,
    kind: (p.kind === 'blank' || p.kind === 'finished') ? p.kind : 'finished',
    description: p.description ? String(p.description) : '',
  }

  // preload specs into form (unknown keys are ignored)
  const s = (p?.specs && typeof p.specs === 'object') ? p.specs : {}
  const next: Record<string, string> = {}
  for (const f of SPEC_FIELDS) next[f.key] = s?.[f.key] ? String(s[f.key]) : ''
  specForm.value = next
  tab.value = 'products'
  createMoreInModal.value = false
  showProductModal.value = true
}

async function loadBlankProducts(search = '') {
  if (!auth.accessToken) return
  blanksLoading.value = true
  try {
    const res = await $fetch<any>('/api/admin/catalog/products', {
      baseURL: apiBaseUrl,
      method: 'GET',
      headers: authHeaders(),
      query: {
        limit: 200,
        page: 1,
        q: String(search || '').trim() || undefined,
        kind: 'blank',
      } as any,
    })
    blankProducts.value = Array.isArray(res?.products) ? res.products : []
  } catch {
    blankProducts.value = []
  } finally {
    blanksLoading.value = false
  }
}

async function loadBomForCurrentProduct() {
  const pid = Number(productForm.value?.id)
  bomError.value = null
  if (!auth.accessToken) return
  if (!pid) {
    bomItems.value = []
    return
  }
  bomLoading.value = true
  try {
    const res = await $fetch<any>(`/api/admin/catalog/products/${pid}/bom`, {
      baseURL: apiBaseUrl,
      method: 'GET',
      headers: authHeaders(),
    })
    const items = Array.isArray(res?.items) ? res.items : []
    bomItems.value = items.map((x: any) => ({ componentProductId: Number(x.componentProductId), qty: Number(x.qty ?? 1) }))
  } catch (e: any) {
    bomError.value = e?.data?.message || 'Не удалось загрузить рецепт'
    bomItems.value = []
  } finally {
    bomLoading.value = false
  }
}

function addBomRow() {
  bomItems.value = [...bomItems.value, { componentProductId: 0, qty: 1 }]
}

function removeBomRow(idx: number) {
  bomItems.value = bomItems.value.filter((_, i) => i !== idx)
}

async function saveBomForCurrentProduct() {
  const pid = Number(productForm.value?.id)
  if (!auth.accessToken) return
  if (!pid) return
  // recipe is only for finished products
  if (productForm.value.kind !== 'finished') return

  const payload = (bomItems.value || [])
    .map((x) => ({ componentProductId: Number(x.componentProductId), qty: Number(x.qty ?? 1) }))
    .filter((x) => Number.isFinite(x.componentProductId) && x.componentProductId > 0 && Number.isFinite(x.qty) && x.qty > 0)

  await $fetch<any>(`/api/admin/catalog/products/${pid}/bom`, {
    baseURL: apiBaseUrl,
    method: 'PUT',
    headers: authHeaders(),
    body: payload,
  })
}

async function saveProduct() {
  if (!auth.accessToken) return
  error.value = null
  const payload: any = {
    slug: String(productForm.value.slug || '').trim(),
    name: String(productForm.value.name || '').trim(),
    article: String(productForm.value.article || '').trim(),
    price: String(productForm.value.price || '').trim(),
    weight:
      productForm.value.weight === '' || productForm.value.weight === null || productForm.value.weight === undefined
        ? undefined
        : Number(String(productForm.value.weight).replace(',', '.')),
    categoryId: Number(productForm.value.categoryId),
    city: String(productForm.value.city || '').trim() || undefined,
    isAvailable: !!productForm.value.isAvailable,
    isActive: productForm.value.isActive !== false,
    kind: productForm.value.kind,
    description: String(productForm.value.description || '').trim() || undefined,
  }

  // specs: store only filled values so they don't show up on product page when empty
  const specs: Record<string, string> = {}
  for (const f of SPEC_FIELDS) {
    const raw = String(specForm.value?.[f.key] ?? '').trim()
    if (raw) specs[f.key] = raw
  }
  payload.specs = Object.keys(specs).length ? specs : null

  try {
    if (productForm.value.id) {
      await $fetch<any>(`/api/admin/catalog/products/${productForm.value.id}`, {
        baseURL: apiBaseUrl,
        method: 'PATCH',
        headers: authHeaders(),
        body: payload,
      })

      // save BOM (only for finished goods)
      try {
        await saveBomForCurrentProduct()
      } catch (e: any) {
        bomError.value = e?.data?.message || 'Не удалось сохранить рецепт'
      }
      await loadProducts()
      showProductModal.value = false
    } else {
      const res = await $fetch<any>('/api/admin/catalog/products', {
        baseURL: apiBaseUrl,
        method: 'POST',
        headers: authHeaders(),
        body: payload,
      })

      // если хотим быстро создавать несколько товаров — очищаем форму, иначе оставляем открытой для загрузки картинок
      if (createMoreInModal.value) {
        resetProductForm()
      } else {
        const created = res?.product
        if (created?.id) {
          // открыть созданный товар в той же модалке, чтобы можно было сразу залить картинки
          productForm.value.id = created.id

          // save BOM for the newly created finished product
          if (productForm.value.kind === 'finished') {
            try {
              await saveBomForCurrentProduct()
            } catch (e: any) {
              bomError.value = e?.data?.message || 'Не удалось сохранить рецепт'
            }
          }
        }
      }
      await loadProducts()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить товар'
  }
}

function buildPreviewDraftProduct() {
  const c = productForm.value.categoryId ? categoryById.value[Number(productForm.value.categoryId)] : null
  const images = orderedProductImages.value.map((x: any, idx: number) => ({
    id: x.id ?? `tmp_${idx}`,
    url: x.url,
    sortOrder: Number(x.sortOrder ?? idx),
  }))

  // specs: only filled
  const specs: Record<string, string> = {}
  for (const f of SPEC_FIELDS) {
    const raw = String(specForm.value?.[f.key] ?? '').trim()
    if (raw) specs[f.key] = raw
  }

  const priceNum = Number(String(productForm.value.price || '').replace(',', '.'))

  return {
    id: productForm.value.id ?? 0,
    slug: String(productForm.value.slug || '').trim(),
    name: String(productForm.value.name || '').trim() || '(без названия)',
    article: String(productForm.value.article || '').trim(),
    price: Number.isFinite(priceNum) ? priceNum : null,
    retailPrice: Number.isFinite(priceNum) ? priceNum : null,
    wholesalePrice: null,
    isAvailable: !!productForm.value.isAvailable,
    isActive: productForm.value.isActive !== false,
    kind: productForm.value.kind,
    description: String(productForm.value.description || '').trim(),
    category: c
      ? { id: c.id, name: c.name, slug: c.slug, parent: c.parent ? { id: c.parent.id, name: c.parent.name, slug: c.parent.slug } : null }
      : null,
    images,
    specs: Object.keys(specs).length ? specs : null,
  }
}

function openProductPreview() {
  try {
    // no navigation: render client template in a modal to avoid auth redirects
    showPreviewModal.value = true
  } catch {
    toast({ type: 'error', title: 'Не удалось открыть предпросмотр' })
  }
}

const previewDraft = computed(() => {
  try {
    return buildPreviewDraftProduct()
  } catch {
    return null
  }
})

const FIELD_LABELS: Record<string, string> = {
  name: 'Название',
  slug: 'Slug',
  article: 'Артикул',
  price: 'Цена',
  weight: 'Вес',
  city: 'Город',
  categoryId: 'Категория',
  isAvailable: 'Доступен',
  isActive: 'Активен',
  kind: 'Тип',
  description: 'Описание',
  specs: 'Характеристики',
}

function formatHistoryValue(v: any) {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean') return v ? 'да' : 'нет'
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

async function archiveProduct(id: number) {
  if (!auth.accessToken) return
  if (!confirm('Отправить товар в архив?')) return
  error.value = null
  try {
    await $fetch<any>(`/api/admin/catalog/products/${id}`, {
      baseURL: apiBaseUrl,
      method: 'DELETE',
      headers: authHeaders(),
    })
    await loadProducts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось удалить товар'
  }
}

async function unarchiveProduct(id: number) {
  if (!auth.accessToken) return
  if (!confirm('Восстановить товар из архива?')) return
  error.value = null
  try {
    await $fetch<any>(`/api/admin/catalog/products/${id}`, {
      baseURL: apiBaseUrl,
      method: 'PATCH',
      headers: authHeaders(),
      body: { archived: false },
    })
    await loadProducts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось восстановить товар'
  }
}



async function cloneProduct(p: any) {
  // legacy direct clone kept for backward compatibility, but UI now uses a modal
  openCloneModal(p)
}

function openCloneModal(p: any) {
  cloneSourceProduct.value = p
  // sensible defaults for serial products
  cloneFields.value = {
    name: true,
    price: true,
    weight: true,
    city: true,
    categoryId: true,
    isAvailable: true,
    kind: true,
    description: true,
    specs: true,
  }
  cloneIncludeImages.value = true
  showCloneModal.value = true
}

async function confirmClone() {
  if (!auth.accessToken) return
  const src = cloneSourceProduct.value
  if (!src?.id) return
  error.value = null
  try {
    const fields = Object.entries(cloneFields.value)
      .filter(([, v]) => !!v)
      .map(([k]) => k)
    const res = await $fetch<any>(`/api/admin/catalog/products/${src.id}/clone`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: authHeaders(),
      body: { fields, includeImages: cloneIncludeImages.value },
    })
    showCloneModal.value = false
    cloneSourceProduct.value = null
    await loadProducts()
    if (res?.product) {
      toast({ type: 'success', title: 'Клон создан', message: 'Товар создан как черновик (скрыт) — можно сразу редактировать.' })
      editProduct(res.product)
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось клонировать товар'
    toast({ type: 'error', title: 'Ошибка', message: error.value || 'Не удалось клонировать' })
  }
}

async function setProductActive(p: any, isActive: boolean) {
  if (!auth.accessToken) return
  error.value = null
  try {
    await $fetch<any>(`/api/admin/catalog/products/${p.id}`, {
      baseURL: apiBaseUrl,
      method: 'PATCH',
      headers: authHeaders(),
      body: { isActive },
    })
    await loadProducts()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось обновить товар'
  }
}

function imageUrl(url: string) {
  if (!url) return ''
  // абсолютный превью-URL
  if (url.startsWith('http')) return url
  const normalized = url.startsWith('/') ? url : `/${url}`
  return `${apiBaseUrl}${normalized}`
}

function productThumb(p: any): string {
  const img = Array.isArray(p?.images) ? p.images[0] : null
  const url = img?.url ? String(img.url) : ''
  return url ? imageUrl(url) : ''
}

// ----------------------
// Images: drag&drop upload + reorder + delete + replace
// ----------------------
const draggingImageIndex = ref<number | null>(null)

const orderedProductImages = computed(() => {
  const list = Array.isArray(productImages.value) ? [...productImages.value] : []
  list.sort((a: any, b: any) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || Number(a.id || 0) - Number(b.id || 0))
  return list
})

async function refreshCurrentProductImages(productId: number) {
  const current = products.value.find((p) => Number(p.id) === Number(productId))
  if (current) productImages.value = Array.isArray((current as any).images) ? (current as any).images : []
}

async function persistImageOrder(productId: number) {
  if (!auth.accessToken) return
  const list = orderedProductImages.value
  try {
    // write sequential sortOrder
    await Promise.all(
      list.map((img: any, idx: number) =>
        $fetch<any>(`/api/admin/catalog/images/${img.id}`, {
          baseURL: apiBaseUrl,
          method: 'PATCH',
          headers: authHeaders(),
          body: { sortOrder: idx },
        }),
      ),
    )
    await loadProducts()
    await refreshCurrentProductImages(productId)
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить порядок картинок'
  }
}

function onImageDragStart(idx: number) {
  draggingImageIndex.value = idx
}

async function onImageDrop(productId: number, targetIdx: number) {
  const from = draggingImageIndex.value
  draggingImageIndex.value = null
  if (from === null || from === targetIdx) return
  const next = [...orderedProductImages.value]
  const [moved] = next.splice(from, 1)
  next.splice(targetIdx, 0, moved)
  // keep local order immediately
  productImages.value = next
  await persistImageOrder(productId)
}

async function deleteImage(productId: number, img: any) {
  if (!auth.accessToken) return
  if (!confirm('Удалить картинку?')) return
  try {
    await $fetch<any>(`/api/admin/catalog/images/${img.id}`, {
      baseURL: apiBaseUrl,
      method: 'DELETE',
      headers: authHeaders(),
    })
    await loadProducts()
    await refreshCurrentProductImages(productId)
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось удалить картинку'
  }
}

async function replaceImage(productId: number, oldImg: any, file?: File) {
  if (!auth.accessToken) return
  if (!file) return
  try {
    const beforeIds = new Set(orderedProductImages.value.map((x: any) => Number(x.id)))
    await uploadImages(productId, [file])
    // after uploadImages we reload products + refresh images
    const after = orderedProductImages.value
    const newImg = after.find((x: any) => x?.id && !beforeIds.has(Number(x.id)))
    if (!newImg?.id) {
      error.value = 'Не удалось определить новую картинку после загрузки'
      return
    }
    await $fetch<any>(`/api/admin/catalog/images/${newImg.id}`, {
      baseURL: apiBaseUrl,
      method: 'PATCH',
      headers: authHeaders(),
      body: { sortOrder: Number(oldImg.sortOrder) || 0 },
    })
    await $fetch<any>(`/api/admin/catalog/images/${oldImg.id}`, {
      baseURL: apiBaseUrl,
      method: 'DELETE',
      headers: authHeaders(),
    })
    await loadProducts()
    await refreshCurrentProductImages(productId)
    await persistImageOrder(productId)
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось заменить картинку'
  }
}

function onDropUpload(productId: number, e: DragEvent) {
  if (!productId) return
  const files = e.dataTransfer?.files
  if (files && files.length) uploadImages(productId, files)
}

async function uploadImages(productId: number, files: FileList | File[]) {
  if (!auth.accessToken) return
  fileUploading.value[productId] = true
  error.value = null
  try {
    const list = Array.isArray(files) ? files : Array.from(files || [])
    for (const file of list) {
      const fd = new FormData()
      fd.append('file', file)
      await $fetch<any>(`/api/admin/catalog/products/${productId}/images`, {
        baseURL: apiBaseUrl,
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      })
    }
    await loadProducts()
    await refreshCurrentProductImages(productId)
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить изображение'
  } finally {
    fileUploading.value[productId] = false
  }
}

watch(showProductModal, (open) => {
  if (!open) {
    productModalTab.value = 'edit'
    showPreviewModal.value = false
    productHistory.value = []
    historyError.value = null
    historyLoading.value = false
    bomItems.value = []
    bomError.value = null
    return
  }
  // opening modal
  productModalTab.value = 'edit'
  // preload blanks list for BOM selector
  if (!blankProducts.value?.length) {
    loadBlankProducts(blanksQ.value)
  }
  // load bom if editing existing product
  loadBomForCurrentProduct()
})

watch(productModalTab, async (t) => {
  if (t !== 'history') return
  const pid = Number(productForm.value?.id)
  if (!pid) {
    productHistory.value = []
    historyError.value = 'История доступна после сохранения товара'
    return
  }
  await loadProductHistory(pid)
})

onMounted(async () => {
  await reloadAll()
  resetProductForm()
})
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <AdminPageHeader 
      title="Каталог" 
      description="Категории, товары, цены и изображения (локальное хранилище)" 
      icon="📚"
    >
      <template #actions>
        <AdminButton @click="reloadAll">Обновить</AdminButton>
      </template>
    </AdminPageHeader>

    <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
      <span>❌</span>
      {{ error }}
    </div>

    <!-- Tab Pills -->
    <div class="bg-slate-100 p-1 rounded-xl inline-flex gap-1">
      <button
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="tab === 'products' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        @click="tab = 'products'"
      >
        📦 Товары
      </button>
      <button
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="tab === 'categories' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        @click="tab = 'categories'"
      >
        🗂️ Категории
      </button>
      <button
        class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
        :class="tab === 'cities' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'"
        @click="tab = 'cities'"
      >
        🏙️ Города
      </button>
    </div>

    <!-- Products -->
    <div v-if="tab === 'products'" class="space-y-4">
      <AdminCard>
        <div class="flex flex-col lg:flex-row lg:items-center gap-3">
          <AdminInput v-model="q" class="flex-1" placeholder="поиск: название / артикул / slug" icon="search" @keydown.enter="loadProducts" />
          <AdminSelect v-model="categoryId" :options="[{ value: '', label: 'Все категории' }, ...categoryOptions.map(c => ({ value: c.id, label: (c.level === 1 ? '— ' : '') + c.name }))]" @update:modelValue="loadProducts" />
          <AdminSelect v-model="issueFilter" :options="[{ value: '', label: 'Все товары' }, { value: 'no_price', label: 'Без цены' }, { value: 'no_image', label: 'Без фото' }, { value: 'no_category', label: 'Без категории' }]" @update:modelValue="loadProducts" />
          <AdminSelect v-model="cityFilter" :options="[{ value: '', label: 'Все города' }, ...cities.map(c => ({ value: c.code, label: `${c.name || c.code} (${c.code})` }))]" @update:modelValue="loadProducts" />
          <AdminSelect v-model="kindFilter" :options="[{ value: '', label: 'Тип: все' }, { value: 'blank', label: 'Заготовка' }, { value: 'finished', label: 'Готовый' }]" @update:modelValue="loadProducts" />
          <label class="flex items-center gap-2 text-sm text-slate-700 select-none whitespace-nowrap">
            <input type="checkbox" v-model="showArchived" @change="loadProducts" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500" />
            Показывать архив
          </label>
          <AdminButton @click="loadProducts">Найти</AdminButton>
          <AdminButton variant="primary" @click="openNewProductModal">Новый товар</AdminButton>
        </div>
      </AdminCard>

      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex items-center gap-3 text-slate-500">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span>Загрузка…</span>
        </div>
      </div>

      <AdminCard v-else :padding="false">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide">
              <tr>
                <th class="text-left font-semibold px-5 py-3.5">SKU/артикул</th>
                <th class="text-left font-semibold px-5 py-3.5">Фото</th>
                <th class="text-left font-semibold px-5 py-3.5">Название</th>
                <th class="text-left font-semibold px-5 py-3.5">Категория</th>
                <th class="text-right font-semibold px-5 py-3.5">Цена</th>
                <th class="text-left font-semibold px-5 py-3.5">Вид</th>
                <th class="text-left font-semibold px-5 py-3.5">Доступен</th>
                <th class="text-left font-semibold px-5 py-3.5">Активен</th>
                <th class="text-right font-semibold px-5 py-3.5">Остаток</th>
                <th class="text-right font-semibold px-5 py-3.5">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in products" :key="p.id" class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                <td class="px-5 py-4 font-mono text-xs text-slate-600">{{ p.article }}</td>
                <td class="px-5 py-4">
                  <div class="h-10 w-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden">
                    <img v-if="productThumb(p)" :src="productThumb(p)" alt="" class="h-full w-full object-cover" loading="lazy" />
                  </div>
                </td>
                <td class="px-5 py-4">
                  <div class="font-semibold text-slate-900">{{ p.name }}</div>
                  <div class="text-[11px] text-slate-500">{{ p.slug }}</div>
                  <div v-if="Array.isArray(p.issues) && p.issues.length" class="mt-1 flex flex-wrap gap-1">
                    <span v-if="p.issues.includes('no_price')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-red-200 bg-red-50 text-red-800">🔴 нет цены</span>
                        <span v-if="p.issues.includes('no_image')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-amber-200 bg-amber-50 text-amber-800">🟡 нет фото</span>
                        <span v-if="p.issues.includes('no_category')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-sky-200 bg-sky-50 text-sky-800">🔵 нет категории</span>
                      </div>
                    </td>
                    <!-- category (inline editable) -->
                    <td class="px-4 py-3">
                      <div
                        class="inline-flex items-center gap-2 rounded-lg px-2 py-1"
                        :class="changedCells[cellKey(p.id, 'categoryId')] ? 'bg-emerald-50' : ''"
                      >
                        <template v-if="editingCell?.id === p.id && editingCell.field === 'categoryId'">
                          <select
                            v-model="editingValue"
                            class="px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs"
                            @change="onEditBlur"
                            @blur="onEditBlur"
                            @keydown="onEditKeydown"
                          >
                            <option value="">—</option>
                            <option v-for="c in categoryOptions" :key="c.id" :value="c.id" :disabled="c.isRoot">
                              {{ c.level === 1 ? '— ' : '' }}{{ c.name }}
                            </option>
                          </select>
                          <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]" @mousedown.prevent @click="saveEditClick">✔</button>
                          <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]" @mousedown.prevent @click="cancelEditClick">✖</button>
                        </template>
                        <button
                          v-else
                          class="text-left hover:underline underline-offset-4 text-sm"
                          title="Нажми, чтобы изменить"
                          @click="startEdit(p, 'categoryId')"
                        >
                          {{ p.category?.name || '—' }}
                        </button>
                      </div>
                    </td>

                    <!-- price (inline editable) -->
                    <td class="px-4 py-3 text-right tabular-nums">
                      <div
                        class="inline-flex items-center justify-end gap-2 rounded-lg px-2 py-1"
                        :class="changedCells[cellKey(p.id, 'price')] ? 'bg-emerald-50' : ''"
                      >
                        <template v-if="editingCell?.id === p.id && editingCell.field === 'price'">
                          <input
                            v-model="editingValue"
                            class="w-24 px-2 py-1 rounded-lg border border-gray-200 text-xs text-right"
                            inputmode="decimal"
                            @blur="onEditBlur"
                            @keydown="onEditKeydown"
                          />
                          <span class="text-xs text-gray-500">₽</span>
                          <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]" @mousedown.prevent @click="saveEditClick">✔</button>
                          <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]" @mousedown.prevent @click="cancelEditClick">✖</button>
                        </template>
                        <button
                          v-else
                          class="hover:underline underline-offset-4"
                          title="Нажми, чтобы изменить"
                          @click="startEdit(p, 'price')"
                        >
                          {{ p.price }} ₽
                        </button>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                        :class="p.kind === 'blank' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'">
                        {{ p.kind === 'blank' ? 'заготовка' : 'готовый товар' }}
                      </span>
                    </td>

                    <!-- availability (inline editable) -->
                    <td class="px-4 py-3">
                      <div
                        class="inline-flex items-center gap-2 rounded-lg px-2 py-1"
                        :class="changedCells[cellKey(p.id, 'isAvailable')] ? 'bg-emerald-50' : ''"
                      >
                        <template v-if="editingCell?.id === p.id && editingCell.field === 'isAvailable'">
                          <select
                            v-model="editingValue"
                            class="px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs"
                            @change="onEditBlur"
                            @blur="onEditBlur"
                            @keydown="onEditKeydown"
                          >
                            <option :value="true">в наличии</option>
                            <option :value="false">нет</option>
                          </select>
                          <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]" @mousedown.prevent @click="saveEditClick">✔</button>
                          <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]" @mousedown.prevent @click="cancelEditClick">✖</button>
                        </template>
                        <button
                          v-else
                          class="inline-flex items-center px-2 py-1 rounded-lg text-xs border hover:opacity-90"
                          :class="p.isAvailable ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-gray-100 text-gray-600 border-gray-200'"
                          title="Нажми, чтобы изменить"
                          @click="startEdit(p, 'isAvailable')"
                        >
                          {{ p.isAvailable ? 'в наличии' : 'нет' }}
                        </button>
                      </div>
                    </td>

                    <td class="px-4 py-3">
                      <div
                        class="inline-flex items-center gap-2 rounded-lg px-2 py-1"
                        :class="changedCells[cellKey(p.id, 'isActive')] ? 'bg-emerald-50' : ''"
                      >
                        <template v-if="editingCell?.id === p.id && editingCell.field === 'isActive'">
                          <select
                            v-model="editingValue"
                            class="px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs"
                            @change="onEditBlur"
                            @blur="onEditBlur"
                            @keydown="onEditKeydown"
                          >
                            <option :value="true">активен</option>
                            <option :value="false">скрыт</option>
                          </select>
                          <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]" @mousedown.prevent @click="saveEditClick">✔</button>
                          <button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]" @mousedown.prevent @click="cancelEditClick">✖</button>
                        </template>
                        <button
                          v-else
                          class="inline-flex items-center px-2 py-1 rounded-lg text-xs border hover:opacity-90"
                          :class="p.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'"
                          title="Нажми, чтобы изменить"
                          @click="startEdit(p, 'isActive')"
                        >
                          {{ p.isActive !== false ? 'активен' : 'скрыт' }}
                        </button>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      <span v-if="p.kind === 'finished'">{{ p.stockQty ?? 0 }}</span>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="inline-flex items-center gap-2">
                        <button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="editProduct(p)">
                          Редактировать
                        </button>
                        <button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="cloneProduct(p)">
                          Копировать
                        </button>
                        <button
                          v-if="p.isActive !== false"
                          class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
                          @click="setProductActive(p, false)"
                        >
                          Выключить
                        </button>
                        <button
                          v-else
                          class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
                          @click="setProductActive(p, true)"
                        >
                          Включить
                        </button>

<button
  v-if="!p.archived"
  class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
  @click="archiveProduct(p.id)"
>
  В архив
</button>
<button
  v-else
  class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
  @click="unarchiveProduct(p.id)"
>
  Из архива
</button>

                      </div>
                    </td>
                  </tr>
                  <tr v-if="products.length === 0" class="border-t border-slate-100">
                    <td colspan="10" class="px-5 py-12 text-center text-slate-500">
                      <div class="text-4xl mb-2">📦</div>
                      <div>Товары не найдены</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AdminCard>
      </div>

      <!-- Product modal (create/edit) -->
      <!-- Clone modal -->
      <div v-if="showCloneModal" class="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30" @click="showCloneModal = false"></div>
        <div class="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div class="flex items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div>
              <div class="text-sm font-semibold">Клонировать товар</div>
              <div class="text-xs text-gray-500">
                Создастся новый товар-черновик (скрыт). Slug и артикул генерируются заново.
              </div>
              <div v-if="cloneSourceProduct" class="text-xs text-gray-600 mt-1">
                Источник: <span class="font-medium">{{ cloneSourceProduct.name }}</span> ({{ cloneSourceProduct.article }})
              </div>
            </div>
            <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="showCloneModal = false">Закрыть</button>
          </div>

          <div class="p-4 space-y-4">
            <div class="rounded-2xl border border-gray-200 p-4">
              <div class="text-sm font-semibold">Какие поля копировать</div>
              <div class="text-xs text-gray-500 mt-1">Категория обязательна — будет скопирована в любом случае.</div>

              <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <label v-for="k in ['name','price','weight','city','isAvailable','kind','description','specs']" :key="k" class="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200">
                  <input type="checkbox" v-model="cloneFields[k]" />
                  <span>{{ FIELD_LABELS[k] || k }}</span>
                </label>
                <label class="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 opacity-80">
                  <input type="checkbox" checked disabled />
                  <span>{{ FIELD_LABELS.categoryId }}</span>
                </label>
              </div>
            </div>

            <div class="rounded-2xl border border-gray-200 p-4">
              <label class="flex items-center gap-2 text-sm">
                <input type="checkbox" v-model="cloneIncludeImages" />
                <span>Копировать фото (сохранить порядок)</span>
              </label>
              <div class="text-xs text-gray-500 mt-1">Фото копируются как записи (URL тот же), чтобы было быстро.</div>
            </div>

            <div class="flex items-center justify-end gap-2">
              <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" type="button" @click="showCloneModal = false">Отмена</button>
              <button class="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90 text-sm" type="button" @click="confirmClone">Клонировать</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showProductModal" class="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30" @click="showProductModal = false"></div>
        <div class="relative w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div class="flex items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div>
              <div class="text-sm font-semibold">{{ productForm.id ? 'Редактировать товар' : 'Новый товар' }}</div>
              <div class="text-xs text-gray-500">Все поля и загрузка картинок — здесь же. UI каталога теперь без боковой формы.</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
                type="button"
                @click="openProductPreview"
              >
                Предпросмотр
              </button>
              <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="resetProductForm">Сброс</button>
              <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="showProductModal = false">Закрыть</button>
            </div>
          </div>

          <div class="px-4 pt-3 border-b border-gray-100">
            <div class="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg"
                :class="productModalTab === 'edit' ? 'bg-white border border-gray-200 shadow-sm' : 'hover:bg-gray-100'"
                @click="productModalTab = 'edit'"
              >
                Данные
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg"
                :class="productModalTab === 'history' ? 'bg-white border border-gray-200 shadow-sm' : 'hover:bg-gray-100'"
                @click="productModalTab = 'history'"
              >
                История
              </button>
            </div>
          </div>

          <div v-if="productModalTab === 'edit'" class="max-h-[75vh] overflow-y-auto p-4 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="grid grid-cols-2 gap-2">
                <input v-model="productForm.slug" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="slug" />
                <input v-model="productForm.article" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="артикул" />
              </div>
              <input v-model="productForm.name" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="название" />
              <div class="grid grid-cols-2 gap-2">
                <input v-model="productForm.price" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="цена (например 590.00)" />
                <input v-model="productForm.weight" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="вес (кг), например 0.5" />
              </div>
              <select v-model="productForm.categoryId" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="" disabled>категория</option>
                <option v-for="c in categoryOptions" :key="c.id" :value="c.id" :disabled="c.isRoot">
                  {{ c.level === 1 ? '— ' : '' }}{{ c.name }}
                </option>
              </select>
              <select v-model="productForm.city" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="">город (не указан)</option>
                <option v-for="c in cities" :key="c.code" :value="c.code">{{ c.name || c.code }} ({{ c.code }})</option>
              </select>
              <select v-model="productForm.kind" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="finished">готовый товар</option>
                <option value="blank">заготовка</option>
              </select>
              <label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200">
                <input type="checkbox" v-model="productForm.isActive" />
                <span>Активен</span>
              </label>
              <label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200">
                <input type="checkbox" v-model="productForm.isAvailable" />
                <span>Доступен (в наличии)</span>
              </label>
              <label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200">
                <input type="checkbox" v-model="createMoreInModal" :disabled="!!productForm.id" />
                <span>Создать ещё (после сохранения очистить форму)</span>
              </label>
            </div>

            <textarea v-model="productForm.description" class="px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[110px] w-full" placeholder="описание" />

            <!-- Production / BOM -->
            <div class="rounded-2xl border border-gray-200 p-4">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="text-sm font-semibold">Производство / Заготовки</div>
                  <div class="text-xs text-gray-500">Рецепт (BOM): какие заготовки нужны на 1 единицу готового товара.</div>
                </div>
                <div class="text-xs" :class="productForm.kind === 'finished' ? (bomItems.length ? 'text-emerald-700' : 'text-amber-700') : 'text-gray-500'">
                  <template v-if="productForm.kind !== 'finished'">доступно только для готового товара</template>
                  <template v-else>рецепт: {{ bomItems.length ? 'есть' : 'нет' }}</template>
                </div>
              </div>

              <div v-if="!productForm.id" class="mt-3 text-xs text-gray-500">Сначала сохрани товар, потом можно привязать заготовки.</div>

              <div v-else class="mt-3 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    v-model="blanksQ"
                    class="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full sm:max-w-[320px]"
                    placeholder="поиск заготовок..."
                    @input="() => loadBlankProducts(blanksQ)"
                  />
                  <div class="text-xs text-gray-500" v-if="blanksLoading">загружаю...</div>
                </div>

                <div v-if="bomError" class="text-xs text-red-600">{{ bomError }}</div>
                <div v-if="bomLoading" class="text-xs text-gray-500">Загрузка рецепта...</div>

                <div v-if="productForm.kind !== 'finished'" class="text-xs text-gray-500">
                  Этот товар помечен как «заготовка». Рецепт задаётся только для «готового товара».
                </div>

                <div v-else class="space-y-2">
                  <div v-if="!bomItems.length" class="text-xs text-gray-500">Пока нет позиций. Добавь заготовку ниже.</div>

                  <div v-for="(row, idx) in bomItems" :key="idx" class="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-2">
                    <select v-model.number="row.componentProductId" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
                      <option :value="0" disabled>заготовка...</option>
                      <option v-for="bp in blankProducts" :key="bp.id" :value="bp.id">
                        {{ bp.name }} ({{ bp.article }})
                      </option>
                    </select>
                    <input v-model.number="row.qty" type="number" min="0.0001" step="0.1" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="qty" />
                    <button type="button" class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="removeBomRow(idx)">Удалить</button>
                  </div>

                  <div class="flex items-center justify-between gap-2 pt-1">
                    <button type="button" class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="addBomRow">
                      + Добавить заготовку
                    </button>
                    <div class="text-xs text-gray-500">Сохраняется вместе с товаром</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Images -->
            <div class="rounded-2xl border border-gray-200 p-4">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="text-sm font-semibold">Изображения</div>
                  <div class="text-xs text-gray-500">Можно добавить несколько. Первая — используется как превью.</div>
                </div>
                <div class="text-xs text-gray-500" v-if="!productForm.id">Сначала сохрани товар</div>
              </div>
              <div class="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                <div
                  class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600"
                  :class="!productForm.id ? 'opacity-60' : 'hover:bg-gray-100'"
                  @dragover.prevent
                  @drop.prevent="(e:any) => productForm.id && onDropUpload(productForm.id, e)"
                >
                  <div class="font-medium text-gray-700">Drag & Drop картинки сюда</div>
                  <div class="text-xs text-gray-500 mt-1">или выбери файлы кнопкой справа. Первая картинка — превью.</div>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="text-xs"
                    :disabled="!productForm.id"
                    @change="(e:any) => productForm.id && uploadImages(productForm.id, e.target.files)"
                  />
                </div>
              </div>

              <div v-if="orderedProductImages.length" class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div
                  v-for="(img, idx) in orderedProductImages"
                  :key="img.id || img.url"
                  class="rounded-2xl border border-gray-200 bg-white overflow-hidden"
                  draggable="true"
                  @dragstart="onImageDragStart(idx)"
                  @dragover.prevent
                  @drop.prevent="() => productForm.id && onImageDrop(productForm.id, idx)"
                >
                  <div class="aspect-square bg-gray-50">
                    <img :src="imageUrl(img.url)" class="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div class="p-2 space-y-2">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[11px] text-gray-500">#{{ idx + 1 }}</span>
                      <span v-if="idx === 0" class="text-[11px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">превью</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        class="px-2 py-1 rounded-xl border border-gray-200 hover:bg-gray-100 text-[11px]"
                        type="button"
                        @click="() => { const el = document.getElementById('replace-img-' + img.id) as HTMLInputElement | null; el?.click() }"
                        :disabled="!productForm.id"
                      >
                        Заменить
                      </button>
                      <button
                        class="px-2 py-1 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-[11px]"
                        type="button"
                        @click="productForm.id && deleteImage(productForm.id, img)"
                        :disabled="!productForm.id"
                      >
                        Удалить
                      </button>
                    </div>
                    <input
                      :id="'replace-img-' + img.id"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="(e:any) => productForm.id && replaceImage(productForm.id, img, e.target.files?.[0])"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Specs -->
            <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
              <div class="text-sm font-semibold">Характеристики товара</div>
              <div class="text-xs text-gray-500">Пустые поля на странице товара не показываются.</div>

              <div v-for="group in Array.from(new Set(SPEC_FIELDS.map((x) => x.group)))" :key="group" class="rounded-xl bg-white border border-gray-200 p-3">
                <div class="text-sm font-medium mb-2">{{ group }}</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <template v-for="f in SPEC_FIELDS.filter((x) => x.group === group)" :key="f.key">
                    <div class="space-y-1">
                      <div class="text-[11px] text-gray-600">{{ f.label }}</div>
                      <select v-if="f.type === 'select'" v-model="specForm[f.key]" class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
                        <option value="">—</option>
                        <option v-for="opt in (f.options || [])" :key="opt" :value="opt">{{ opt }}</option>
                      </select>
                      <input v-else v-model="specForm[f.key]" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" :placeholder="f.placeholder || ''" />
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="max-h-[75vh] overflow-y-auto p-4">
            <div v-if="historyError" class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {{ historyError }}
            </div>
            <div v-else-if="historyLoading" class="text-sm text-gray-500">Загрузка истории…</div>
            <div v-else>
              <div v-if="!productHistory.length" class="text-sm text-gray-500">Пока нет изменений.</div>
              <div v-else class="space-y-2">
                <div
                  v-for="ev in productHistory"
                  :key="ev.id"
                  class="rounded-2xl border border-gray-200 bg-white p-3"
                >
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="text-xs text-gray-500">
                      {{ new Date(ev.createdAt).toLocaleString() }}
                      <span v-if="ev.user" class="text-gray-600">· {{ ev.user.name }}</span>
                    </div>
                    <div class="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">
                      {{ ev.action }}
                    </div>
                  </div>
                  <div class="mt-2 text-sm" v-if="ev?.meta?.field">
                    <div class="font-medium text-gray-800">{{ FIELD_LABELS[ev.meta.field] || ev.meta.field }}</div>
                    <div class="mt-1 text-xs text-gray-600 break-all">
                      <span class="text-gray-500">{{ formatHistoryValue(ev.meta.from) }}</span>
                      <span class="mx-1">→</span>
                      <span class="text-gray-900">{{ formatHistoryValue(ev.meta.to) }}</span>
                    </div>
                  </div>
                  <div class="mt-2 text-sm" v-else>
                    <div class="text-xs text-gray-600 break-all">{{ JSON.stringify(ev.meta || {}) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="productModalTab === 'edit'" class="p-4 border-t border-gray-100">
            <button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90" @click="saveProduct">
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <!-- Preview modal (inside admin, no navigation) -->
      <div v-if="showPreviewModal" class="fixed inset-0 z-[1200] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="showPreviewModal = false"></div>
        <div class="relative w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div class="flex items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div>
              <div class="text-sm font-semibold flex items-center gap-2">
                Предпросмотр
                <span class="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">черновик</span>
              </div>
              <div class="text-xs text-gray-500">Рендер из текущих данных формы (даже несохранённых).</div>
            </div>
            <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" type="button" @click="showPreviewModal = false">Закрыть</button>
          </div>

          <div class="max-h-[75vh] overflow-y-auto p-4" v-if="previewDraft">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ProductGallery :images="previewDraft.images || []" :alt="previewDraft.name" />
              </div>
              <div class="space-y-4">
                <h2 class="text-2xl font-semibold">{{ previewDraft.name }}</h2>
                <div class="text-sm text-gray-500">Артикул: {{ previewDraft.article || '—' }}</div>
                <div class="flex items-center gap-3">
                  <ProductAvailabilityBadge :isAvailable="!!previewDraft.isAvailable" />
                  <span v-if="!previewDraft.isActive" class="text-[11px] px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">не опубликован</span>
                </div>

                <ProductPriceBlock
                  :retailPrice="previewDraft.retailPrice ?? previewDraft.price ?? 0"
                  :wholesalePrice="previewDraft.wholesalePrice ?? null"
                />

                <div v-if="previewDraft.description" class="prose prose-sm max-w-none">
                  <p class="whitespace-pre-wrap">{{ previewDraft.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-4 text-sm text-gray-500">Не удалось собрать данные предпросмотра.</div>
        </div>
      </div>

      <!-- Categories -->
      <div v-if="tab === 'categories'" class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">{{ catForm.id ? 'Редактировать категорию' : 'Новая категория' }}</div>
              <div class="text-xs text-gray-500">Удаление блокируется, если внутри есть товары.</div>
            </div>
            <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="resetCatForm">
              Сброс
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <input v-model="catForm.slug" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="slug" />
            <input v-model="catForm.name" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="название" />

            <div class="rounded-xl border border-gray-200 p-3">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold text-gray-700">Картинка категории</div>
                  <div class="text-[11px] text-gray-500">Загружается локально в backend/uploads/static/categories</div>
                </div>
                <input type="file" accept="image/*" class="text-xs" @change="uploadCategoryImage" />
              </div>
              <div class="mt-2 flex items-center gap-3">
                <div class="h-12 w-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  <img v-if="catForm.imageUrl" :src="imageUrl(catForm.imageUrl)" class="h-full w-full object-cover" />
                </div>
                <input v-model="catForm.imageUrl" class="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs" placeholder="/uploads/static/categories/..." />
              </div>
            </div>
            <select v-model="catForm.parentId" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
              <option :value="null">Родительская категория: нет (корневая)</option>
              <option v-for="r in roots" :key="r.id" :value="r.id">Родитель: {{ r.name }}</option>
            </select>

            <div class="grid grid-cols-2 gap-2">
              <input v-model.number="catForm.sortOrder" type="number" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="порядок" />
              <label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200">
                <input type="checkbox" v-model="catForm.isActive" />
                <span>Активна</span>
              </label>
            </div>
            <textarea v-model="catForm.description" class="px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[90px]" placeholder="описание" />
            <button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90" @click="saveCategory">
              Сохранить
            </button>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th class="text-left px-4 py-3">Категория</th>
                  <th class="text-left px-4 py-3">Slug</th>
                  <th class="text-right px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="opt in categoryOptions" :key="opt.id" class="border-t border-gray-100">
                  <td class="px-4 py-3">
                    <div class="font-medium" :class="opt.level === 1 ? 'pl-4 text-gray-900' : ''">
                      {{ opt.level === 1 ? '↳' : '' }} {{ categoryById[opt.id]?.name }}
                    </div>
                    <div class="text-xs text-gray-500" v-if="categoryById[opt.id]?.parent">
                      Подкатегория: {{ categoryById[opt.id]?.parent?.name }}
                    </div>
                    <div class="text-xs text-gray-500" v-if="categoryById[opt.id]?.description">{{ categoryById[opt.id]?.description }}</div>
                    <div class="text-[11px] text-gray-400" v-if="categoryById[opt.id]?.isActive === false">неактивна</div>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ categoryById[opt.id]?.slug }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="inline-flex gap-2">
                      <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="editCategory(categoryById[opt.id])">
                        Редактировать
                      </button>
                      <button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs" @click="deleteCategory(opt.id)">
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="categories.length === 0" class="border-t border-gray-100">
                  <td colspan="3" class="px-4 py-8 text-center text-gray-500">Категорий нет</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Cities -->
      <div v-if="tab === 'cities'" class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <div class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">Города</div>
              <div class="text-xs text-gray-500">Эти города используются в выборе города и в поле «город» у товара.</div>
            </div>
          </div>

          <div class="mt-4 space-y-2">
            <div class="grid grid-cols-3 gap-2">
              <input v-model="cityForm.code" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="BIR" />
              <input v-model="cityForm.regionCode" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="79" />
              <input v-model="cityForm.name" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="Биробиджан" />
            </div>
            <button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90" @click="saveCity">
              Добавить / обновить
            </button>
            <div class="text-[11px] text-gray-500">Витрине нужен минимум один город (если удалить все — будет создан дефолтный).</div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs text-gray-600">
                <tr>
                  <th class="text-left px-4 py-3">Код</th>
                  <th class="text-left px-4 py-3">Регион</th>
                  <th class="text-left px-4 py-3">Название</th>
                  <th class="text-right px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in cities" :key="c.code" class="border-t border-gray-100">
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ c.code }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ c.regionCode || '' }}</td>
                  <td class="px-4 py-3">
                    <div class="font-medium">{{ c.name || c.code }}</div>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs" @click="deleteCity(c.code)">
                      Удалить
                    </button>
                  </td>
                </tr>

                <tr v-if="cities.length === 0" class="border-t border-gray-100">
                  <td colspan="4" class="px-4 py-8 text-center text-gray-500">Городов нет</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section></template>
