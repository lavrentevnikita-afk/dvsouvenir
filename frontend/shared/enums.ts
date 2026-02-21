// Keep in sync with backend/src/shared/enums.ts

export const WAREHOUSE_CODES = {
  BLANKS: 'BLANKS',
  FINISHED: 'FINISHED',
  DEFECT: 'DEFECT',
} as const

export type WarehouseCode = (typeof WAREHOUSE_CODES)[keyof typeof WAREHOUSE_CODES]

export const WAREHOUSE_TYPES = {
  BLANKS: 'BLANKS',
  FINISHED: 'FINISHED',
  DEFECT: 'DEFECT',
} as const

export type WarehouseType = (typeof WAREHOUSE_TYPES)[keyof typeof WAREHOUSE_TYPES]

export const STOCK_MOVEMENT_TYPES = {
  IN: 'in',
  OUT: 'out',
  RESERVE: 'reserve',
  UNRESERVE: 'unreserve',
  ADJUST: 'adjust',
  INVENTORY_ADJUST: 'inventory_adjust',
  MIGRATION_IN: 'migration_in',
} as const

export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[keyof typeof STOCK_MOVEMENT_TYPES]
