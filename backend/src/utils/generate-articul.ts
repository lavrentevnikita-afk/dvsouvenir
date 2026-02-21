// Генерация артикула: <код города>-<порядковый номер с ведущими нулями>
// Пример: 79-0001

export function generateArticul(cityCode: string | number, seq: number): string {
  const code = String(cityCode).padStart(2, '0')
  const num = String(seq).padStart(4, '0')
  return `${code}-${num}`
}

// Пример использования:
// generateArticul(79, 1) // '79-0001'
// generateArticul('25', 42) // '25-0042'