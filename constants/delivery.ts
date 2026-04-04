export const DELIVERY_COST = 1.00

export const AVAILABLE_DAYS = ['lunes', 'miércoles', 'sábado'] as const

export const TIME_SLOTS = [
  { key: '12:00', label: '12:00pm', column: 1 },
  { key: '12:30', label: '12:30pm', column: 1 },
  { key: '13:00', label: '1:00pm', column: 1 },
  { key: '13:30', label: '1:30pm', column: 1 },
  { key: '15:00', label: '3:00pm', column: 2 },
  { key: '15:30', label: '3:30pm', column: 2 },
  { key: '16:00', label: '4:00pm', column: 2 },
  { key: '16:30', label: '4:30pm', column: 2 },
  { key: '17:00', label: '5:00pm', column: 2 },
  { key: '17:30', label: '5:30pm', column: 2 },
] as const

export const SHIFTS = {
  '12:00': '12:00pm',
  '12:30': '12:30pm',
  '13:00': '1:00pm',
  '13:30': '1:30pm',
  '15:00': '3:00pm',
  '15:30': '3:30pm',
  '16:00': '4:00pm',
  '16:30': '4:30pm',
  '17:00': '5:00pm',
  '17:30': '5:30pm',
  acordar: 'Acordar con las vendedoras',
}