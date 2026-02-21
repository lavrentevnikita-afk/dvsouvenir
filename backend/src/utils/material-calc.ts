// Утилита для расчёта количества листов материала для заказа изделий по размерам
// Размеры в миллиметрах

export function calcMaterialSheets({
  sheetWidth,
  sheetHeight,
  itemWidth,
  itemHeight,
  itemCount,
  gap = 0, // зазор между изделиями, мм
}: {
  sheetWidth: number
  sheetHeight: number
  itemWidth: number
  itemHeight: number
  itemCount: number
  gap?: number
}): {
  perSheet: number
  sheetsNeeded: number
  layout: { across: number; down: number }
} {
  // С учётом зазора между изделиями
  const usableWidth = sheetWidth + gap
  const usableHeight = sheetHeight + gap
  const itemFullWidth = itemWidth + gap
  const itemFullHeight = itemHeight + gap

  const across = Math.floor(usableWidth / itemFullWidth)
  const down = Math.floor(usableHeight / itemFullHeight)
  const perSheet = across * down
  const sheetsNeeded = perSheet > 0 ? Math.ceil(itemCount / perSheet) : 0

  return {
    perSheet,
    sheetsNeeded,
    layout: { across, down },
  }
}

// Пример использования:
// const result = calcMaterialSheets({
//   sheetWidth: 1400,
//   sheetHeight: 650,
//   itemWidth: 85,
//   itemHeight: 60,
//   itemCount: 200,
//   gap: 0
// })
// console.log(result)
