import { Flavor } from '@/types'

export const FLAVORS: Flavor[] = [
  { id: 'clasico', name: 'Clásico', extraCost: 0, isSpecial: false },
  { id: 'oreo', name: 'Oreo', extraCost: 0, isSpecial: false },
  { id: 'pistacho', name: 'Pistacho', extraCost: 0, isSpecial: false },
  { id: 'manjar_nueces', name: 'Manjar y Nueces', extraCost: 0, isSpecial: false },
  { id: 'choco_avellana', name: 'Choco Avellana', extraCost: 0, isSpecial: false },
  { id: 'frutos_rojos', name: 'Frutos Rojos', extraCost: 0, isSpecial: false },
  { id: 'creme_brulee', name: 'Creme Brulee', extraCost: 0, isSpecial: true },
  { id: 'pizza', name: 'Pizza', extraCost: 0, isSpecial: true },
]

// Precio por rol según categoría
export const ROLL_PRICES = {
  clasico: 1.00,   // Solo el clásico a $1
  premium: 1.50,   // Oreo, Pistacho, Manjar, Choco Avellana, Frutos Rojos
  especial: 2.00,  // Creme Brulee, Pizza
}

// Qué categoría es cada sabor
export function getRollPrice(flavorId: string): number {
  if (['creme_brulee', 'pizza'].includes(flavorId)) return ROLL_PRICES.especial
  if (flavorId === 'clasico') return ROLL_PRICES.clasico
  return ROLL_PRICES.premium
}

export const PRICES = {
  caja_4: 0,   // Se calcula por sabores
  caja_6: 0,
  individual: 0,
}

export const CONTAINER_LABELS = {
  caja_4: 'Caja x4',
  caja_6: 'Caja x6',
  individual: 'Individual',
}

export const CONTAINER_CAPACITY = {
  caja_4: 4,
  caja_6: 6,
  individual: 1,
}