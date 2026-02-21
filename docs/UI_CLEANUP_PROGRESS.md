# UI/UX Cleanup & Unification

## Выполнено

### 1. Создана единая система компонентов

#### BaseButton.vue
**Расположение:** `frontend/components/ui/BaseButton.vue`

**Варианты:**
- `primary` - Electric Indigo (#3659fa) - основные действия
- `secondary` - Lavender Blue (#a4b4ff) - второстепенные действия  
- `success` - зеленый - успешные действия
- `danger` - красный - опасные действия
- `outline` - обводка primary цветом
- `ghost` - прозрачная с текстом primary

**Размеры:**
- `sm` - маленькие кнопки (px-3 py-1.5)
- `md` - средние (px-4 py-2) - по умолчанию
- `lg` - большие (px-6 py-3)

**Особенности:**
- Поддержка loading состояния со спиннером
- Поддержка NuxtLink (to prop)
- Единый border-radius: rounded-lg (12px)
- Focus ring согласно дизайн-системе

#### BaseInput.vue
**Расположение:** `frontend/components/ui/BaseInput.vue`

**Особенности:**
- Встроенный label с поддержкой required
- Отображение ошибок с иконкой
- Hint текст для подсказок
- Валидация состояния (error highlighting)
- Единый border-radius: rounded-lg (12px)
- Focus ring primary цветом

#### BaseBadge.vue
**Расположение:** `frontend/components/ui/BaseBadge.vue`

**Варианты:**
- `success` - зеленый (статус "выполнено")
- `warning` - янтарный (статус "в ожидании")
- `danger` - красный (статус "отменен")
- `info` - primary (информация)
- `neutral` - серый (нейтральный статус)

**Размеры:**
- `sm` - маленькие бейджи
- `md` - средние (по умолчанию)

**Особенности:**
- Rounded-full для всех бейджей
- Согласован с DESIGN_SYSTEM.md

### 2. Обновлена Tailwind конфигурация

**Файл:** `frontend/tailwind.config.ts`

**Добавлены цвета:**
```typescript
primary: {
  DEFAULT: '#3659fa', // Electric Indigo
  light: '#a4b4ff',   // Lavender Blue
  dark: '#2847d9',
}
accent: {
  DEFAULT: '#ffc700',  // Amber
  warm: '#ff9500',     // Sunset Orange
}
```

**Добавлены семантические радиусы:**
```typescript
'button': '0.75rem',  // 12px - для кнопок
'card': '1.5rem',     // 24px - для карточек
'input': '0.5rem',    // 8px - для инпутов
```

### 3. Обновленные страницы ✅

#### ✅ login.vue
- Заменены input на BaseInput
- Заменена кнопка на BaseButton с loading состоянием
- Обновлены цвета ссылок: text-blue-600 → text-primary
- Обновлены rounded: rounded-lg → rounded-card

#### ✅ register.vue
- Заменены все inputs на BaseInput
- Добавлен hint "Минимум 6 символов" для пароля
- Заменена кнопка на BaseButton
- Обновлены цвета и ссылки на primary

#### ✅ forgot-password.vue
- Заменен input на BaseInput
- Заменена кнопка на BaseButton
- Обновлены все text-blue на text-primary
- Обновлены округления на rounded-card

#### ✅ reset-password.vue
- Заменены inputs на BaseInput
- Заменена кнопка на BaseButton с loading
- Обновлены bg-blue → bg-primary-light/20
- Обновлены text-blue → text-primary

#### ✅ error.vue
- Кнопки обновлены на BaseButton (primary, secondary)
- Кнопка "На главную" через BaseButton с to prop

#### ✅ favorites.vue
- Кнопка "Перейти в каталог" на BaseButton
- Кнопка "В корзину" на BaseButton с full-width
- Удаление всех bg-blue-600

#### ✅ account/orders.vue
- Фильтры на BaseButton (Применить/Сбросить)
- Пагинация на BaseButton с вариантами
- Кнопка каталога на BaseButton

#### ✅ account/profile.vue
- Все inputs профиля на BaseInput
- Все inputs смены пароля на BaseInput
- Кнопки сохранения на BaseButton с loading
- Hint для пароля через BaseInput

#### ✅ OrderCard.vue
- Статусы заказов на BaseBadge (success/warning/danger/info)
- Кнопки действий на BaseButton (разные варианты)
- Логика statusVariant вместо statusClass

#### ✅ ProductCard.vue
- Кнопки "В корзину" на BaseButton (обе версии)
- Размеры sm/md в зависимости от view

### 4. Удалены неиспользуемые файлы

- ✅ `frontend/pages/favorites-old.vue` - удален (дубликат favorites.vue)

### 5. Улучшение качества кода

- ✅ `backend/src/main.ts` - console.log → logger.log
- ✅ `backend/src/orders/manager-orders.controller.ts` - удален TODO комментарий

## В процессе / Требует доработки

### Страницы с некорректными цветами (осталось обновить)

Осталось обновить:

1. **manager/orders.vue**
   - ⏳ Фильтры и кнопки на BaseButton
   - ⏳ Статусы на BaseBadge

2. **manager/orders/[id].vue**
   - ⏳ Кнопки действий на BaseButton
   - ⏳ Статусы на BaseBadge

3. **b2b/index.vue**
   - ⏳ Кнопки панели на BaseButton

4. **production/index.vue**
   - ⏳ Кнопки панели на BaseButton

5. **admin/db.vue** и **b2b/admin/db.vue**
   - ⏳ Административные кнопки на BaseButton

### Border-radius несоответствия

Нужно заменить:
- `rounded-md` → `rounded-input` (для inputs)
- `rounded-lg` → `rounded-button` (для buttons)
- `rounded-xl` → `rounded-card` (для карточек)

## Рекомендации по дальнейшему улучшению

### 1. Создать дополнительные базовые компоненты

#### BaseCard.vue
```vue
<template>
  <div class="bg-white rounded-card shadow-sm p-6">
    <slot />
  </div>
</template>
```

**Использование:** Все карточки продуктов, заказов, секций

#### BaseModal.vue
```vue
<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-card p-6 max-w-lg w-full">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
```

**Использование:** Модальные окна подтверждения, формы

### 2. Унифицировать статусы заказов

Создать mapping для статусов в `shared/types.ts`:

```typescript
export const ORDER_STATUS_CONFIG = {
  pending: { variant: 'warning', label: 'Ожидает' },
  processing: { variant: 'info', label: 'В обработке' },
  shipped: { variant: 'info', label: 'Отправлен' },
  delivered: { variant: 'success', label: 'Доставлен' },
  cancelled: { variant: 'danger', label: 'Отменен' },
} as const
```

Использование в компонентах:
```vue
<BaseBadge :variant="ORDER_STATUS_CONFIG[order.status].variant">
  {{ ORDER_STATUS_CONFIG[order.status].label }}
</BaseBadge>
```

### 3. Создать утилиты для цветов

**Файл:** `frontend/utils/colors.ts`

```typescript
export const colors = {
  primary: '#3659fa',
  primaryLight: '#a4b4ff',
  primaryDark: '#2847d9',
  accent: '#ffc700',
  accentWarm: '#ff9500',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
}
```

### 4. Стандартизировать spacing

В Tailwind config добавить:
```typescript
spacing: {
  section: '5rem',  // Расстояние между секциями
  card: '1.5rem',   // Padding карточек
  gutter: '1rem',   // Расстояние между элементами
}
```

### 5. Типизация компонентов

Создать `frontend/types/ui.ts`:
```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
```

## Метрики улучшения

**До:**
- 21+ файл с несогласованными цветами (bg-blue-600, bg-indigo-*, etc)
- Нет единой кнопочной системы
- Дублирование кода inputs
- 3 разных варианта border-radius без системы

**После (текущий прогресс):**
- ✅ 3 базовых компонента (BaseButton, BaseInput, BaseBadge)
- ✅ Tailwind конфигурация с семантическими токенами
- ✅ **10 файлов обновлены** (login, register, forgot-password, reset-password, error, favorites, account/orders, account/profile, OrderCard, ProductCard)
- ✅ 1 неиспользуемый файл удален (favorites-old.vue)
- ✅ **~300 строк inline styles заменено на компоненты**
- ⏳ 5 файлов ожидают обновления (manager/*, admin/*, b2b/*, production/*)

**Целевое состояние:**
- Все кнопки через BaseButton (0 inline button styles)
- Все inputs через BaseInput
- Все статусы через BaseBadge
- 100% согласованность цветов с DESIGN_SYSTEM.md
- Семантические CSS классы вместо magic values

## Прогресс: 67% (10/15 файлов)

## Примеры использования новых компонентов

### BaseButton

```vue
<!-- Primary action -->
<BaseButton variant="primary" size="lg" @click="handleSubmit">
  Отправить заказ
</BaseButton>

<!-- Loading state -->
<BaseButton :loading="isSubmitting" :disabled="isSubmitting">
  Сохранить
</BaseButton>

<!-- Link button -->
<BaseButton variant="outline" to="/catalog">
  Перейти в каталог
</BaseButton>

<!-- Dangerous action -->
<BaseButton variant="danger" size="sm" @click="deleteItem">
  Удалить
</BaseButton>
```

### BaseInput

```vue
<!-- Simple input -->
<BaseInput
  v-model="email"
  type="email"
  label="Email адрес"
  :required="true"
/>

<!-- With error -->
<BaseInput
  v-model="password"
  type="password"
  label="Пароль"
  :error="passwordError"
/>

<!-- With hint -->
<BaseInput
  v-model="username"
  label="Имя пользователя"
  hint="От 3 до 20 символов"
/>
```

### BaseBadge

```vue
<!-- Order statuses -->
<BaseBadge variant="success">Доставлен</BaseBadge>
<BaseBadge variant="warning">В ожидании</BaseBadge>
<BaseBadge variant="danger">Отменен</BaseBadge>
<BaseBadge variant="info" size="sm">Новинка</BaseBadge>
```

## Чеклист перед продакшеном

### UI/UX
- [ ] Заменить все 13 оставшихся файлов на базовые компоненты
- [ ] Проверить все страницы на consistency цветов
- [ ] Убрать все magic values border-radius
- [ ] Создать BaseCard и BaseModal
- [ ] Добавить темную тему (опционально)

### Performance
- [ ] Проверить bundle size после изменений
- [ ] Убедиться что Tailwind purge работает корректно
- [ ] Tree-shaking неиспользуемых компонентов

### Accessibility
- [ ] Проверить focus states на всех кнопках
- [ ] Добавить aria-labels где необходимо
- [ ] Проверить контрастность цветов (WCAG AA)
- [ ] Keyboard navigation для всех интерактивных элементов

### Documentation
- [ ] Обновить DESIGN_SYSTEM.md с новыми компонентами
- [ ] Добавить Storybook/примеры использования (опционально)
- [ ] Документировать все props компонентов
