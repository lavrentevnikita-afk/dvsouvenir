<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'b2b', middleware: ['b2b', 'admin'] })

const auth = useAuthStore()
auth.initFromStorage()

const config = useRuntimeConfig()
const apiBaseUrl = process.server ? (config as any).apiBaseUrl : (config.public as any).apiBaseUrl

const tab = ref<'categories' | 'products' | 'cities'>('products')

const loading = ref(false)
const error = ref<string | null>(null)

const categories = ref<any[]>([])
const products = ref<any[]>([])
const productImages = ref<any[]>([])
const warehouses = ref<Array<{ code: string; name: string; regionCode?: string }>>([])

const cityForm = ref<{ code: string; regionCode: string; name: string }>({ code: '', regionCode: '', name: '' })

const q = ref('')
const categoryId = ref<number | ''>('')

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
const createMoreInModal = ref(false)

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
  if (productForm.value.id) return

  const currentArticle = String(productForm.value.article || '').trim()
  if (currentArticle && currentArticle !== lastAutoArticle.value) return

  try {
    const cityCode = String(city || '').trim().toUpperCase()
    const res = await $fetch<any>('/api/admin/catalog/next-article', {
      baseURL: apiBaseUrl,
      headers: authHeaders(),
      query: cityCode ? { city: cityCode } : undefined,
    })
    if (res?.article) {
      productForm.value.article = String(res.article)
      lastAutoArticle.value = String(res.article)
    }
  } catch {
    // молча
  }
}

watch(() => productForm.value.city, (city) => fetchAutoArticle(city))

// Автовыбор типа товара по категории ("Заготовки" -> blank)
watch(
  () => productForm.value.categoryId,
  (cid) => {
    if (productForm.value.id) return
    const currentKind = (productForm.value.kind === 'blank' || productForm.value.kind === 'finished') ? productForm.value.kind : 'finished'
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

async function reloadAll() {
  loading.value = true
  error.value = null
  try {
    await loadCategories()
    await loadProducts()
    await loadWarehouses()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось загрузить данные'
  } finally {
    loading.value = false
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
    const res = await $fetch<any>('/api/ops/warehouses', {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: authHeaders(),
      body: payload,
    })
    if (res?.ok === false) {
      error.value = res?.message || 'Не удалось сохранить город'
    }
    cityForm.value = { code: '', regionCode: '', name: '' }
    await loadWarehouses()
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить город'
  }
}

async function deleteCity(code: string) {
  if (!auth.accessToken) return
  if (!confirm(`Удалить город ${code}?`)) return
  error.value = null
  try {
    const res = await $fetch<any>(`/api/ops/warehouses/${encodeURIComponent(code)}`, {
      baseURL: apiBaseUrl,
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (res?.ok === false) {
      error.value = res?.message || 'Нельзя удалить город'
      return
    }
    await loadWarehouses()
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
}

function openNewProductModal() {
  resetProductForm()
  createMoreInModal.value = false
  showProductModal.value = true
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
        }
      }
      await loadProducts()
    }
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось сохранить товар'
  }
}

async function deleteProduct(id: number) {
  if (!auth.accessToken) return
  if (!confirm('Удалить товар?')) return
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

async function cloneProduct(p: any) {
  if (!auth.accessToken) return
  error.value = null
  try {
    const res = await $fetch<any>(`/api/admin/catalog/products/${p.id}/clone`, {
      baseURL: apiBaseUrl,
      method: 'POST',
      headers: authHeaders(),
    })
    await loadProducts()
    if (res?.product) editProduct(res.product)
  } catch (e: any) {
    error.value = e?.data?.message || 'Не удалось скопировать товар'
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

onMounted(async () => {
  await reloadAll()
  resetProductForm()
})
</script>

<template>
  <section class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">Админка — каталог</h1>
          <p class="text-sm text-gray-600 mt-1">Категории, товары, цены и изображения (локальное хранилище)</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="reloadAll">
            Обновить
          </button>
        </div>
      </div>

      <div v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </div>

      <div class="flex items-center gap-2">
        <button
          class="px-3 py-2 rounded-xl border text-sm"
          :class="tab === 'products' ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'"
          @click="tab = 'products'"
        >
          Товары
        </button>
        <button
          class="px-3 py-2 rounded-xl border text-sm"
          :class="tab === 'categories' ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'"
          @click="tab = 'categories'"
        >
          Категории
        </button>
        <button
          class="px-3 py-2 rounded-xl border text-sm"
          :class="tab === 'cities' ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'"
          @click="tab = 'cities'"
        >
          Города
        </button>
      </div>

      <!-- Products -->
      <div v-if="tab === 'products'" class="space-y-4">
          <div class="rounded-2xl border border-gray-200 bg-white p-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <input v-model="q" class="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="поиск: название / артикул / slug" @keydown.enter="loadProducts" />
              <select v-model="categoryId" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm" @change="loadProducts">
                <option value="">все категории</option>
                <option
                  v-for="c in categoryOptions"
                  :key="c.id"
                  :value="c.id"
                >
                  {{ c.level === 1 ? '— ' : '' }}{{ c.name }}
                </option>
              </select>
              <button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" @click="loadProducts">
                Найти
              </button>
              <button class="px-3 py-2 rounded-xl bg-sky-600 text-white hover:opacity-90 text-sm" @click="openNewProductModal">
                Новый товар
              </button>
            </div>
          </div>

          <div v-if="loading" class="text-sm text-gray-500">Загрузка…</div>

          <div v-else class="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-gray-600">
                  <tr>
                    <th class="text-left font-semibold px-4 py-3">SKU/артикул</th>
                    <th class="text-left font-semibold px-4 py-3">Фото</th>
                    <th class="text-left font-semibold px-4 py-3">Название</th>
                    <th class="text-left font-semibold px-4 py-3">Категория</th>
                    <th class="text-right font-semibold px-4 py-3">Цена</th>
                    <th class="text-left font-semibold px-4 py-3">Вид</th>
                    <th class="text-left font-semibold px-4 py-3">Активен</th>
                    <th class="text-right font-semibold px-4 py-3">Остаток</th>
                    <th class="text-right font-semibold px-4 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in products" :key="p.id" class="border-t border-gray-100 hover:bg-gray-50">
                    <td class="px-4 py-3 font-mono text-xs">{{ p.article }}</td>
                    <td class="px-4 py-3">
                      <div class="h-10 w-10 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden">
                        <img v-if="productThumb(p)" :src="productThumb(p)" alt="" class="h-full w-full object-cover" loading="lazy" />
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="font-semibold">{{ p.name }}</div>
                      <div class="text-[11px] text-gray-500">{{ p.slug }}</div>
                    </td>
                    <td class="px-4 py-3">{{ p.category?.name || '—' }}</td>
                    <td class="px-4 py-3 text-right tabular-nums">{{ p.price }} ₽</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                        :class="p.kind === 'blank' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'">
                        {{ p.kind === 'blank' ? 'заготовка' : 'готовый товар' }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border"
                        :class="p.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'">
                        {{ p.isActive !== false ? 'активен' : 'скрыт' }}
                      </span>
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
                      </div>
                    </td>
                  </tr>
                  <tr v-if="products.length === 0" class="border-t border-gray-100">
                    <td colspan="9" class="px-4 py-10 text-center text-gray-500">Товары не найдены</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
      </div>

      <!-- Product modal (create/edit) -->
      <div v-if="showProductModal" class="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/30" @click="showProductModal = false"></div>
        <div class="relative w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div class="flex items-start justify-between gap-3 p-4 border-b border-gray-100">
            <div>
              <div class="text-sm font-semibold">{{ productForm.id ? 'Редактировать товар' : 'Новый товар' }}</div>
              <div class="text-xs text-gray-500">Все поля и загрузка картинок — здесь же. UI каталога теперь без боковой формы.</div>
            </div>
            <div class="flex items-center gap-2">
              <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="resetProductForm">Сброс</button>
              <button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" @click="showProductModal = false">Закрыть</button>
            </div>
          </div>

          <div class="max-h-[75vh] overflow-y-auto p-4 space-y-4">
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
                <option v-for="w in warehouses" :key="w.code" :value="w.code">{{ w.name || w.code }} ({{ w.code }})</option>
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

          <div class="p-4 border-t border-gray-100">
            <button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90" @click="saveProduct">
              Сохранить
            </button>
          </div>
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
              <div class="text-sm font-semibold">Города (склады)</div>
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
            <div class="text-[11px] text-gray-500">Базовый склад (MAIN) лучше не удалять — витрине нужен минимум один.</div>
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
                <tr v-for="w in warehouses" :key="w.code" class="border-t border-gray-100">
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ w.code }}</td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-600">{{ w.regionCode || '' }}</td>
                  <td class="px-4 py-3">
                    <div class="font-medium">{{ w.name || w.code }}</div>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs" @click="deleteCity(w.code)">
                      Удалить
                    </button>
                  </td>
                </tr>

                <tr v-if="warehouses.length === 0" class="border-t border-gray-100">
                  <td colspan="4" class="px-4 py-8 text-center text-gray-500">Городов нет</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section></template>
