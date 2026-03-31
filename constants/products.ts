import { Flavor } from '@/types'

export const FLAVORS: Flavor[] = [
  { id: 'clasico', name: 'Canela clásico', extraCost: 0, isSpecial: false },
  { id: 'nutella', name: 'Nutella', extraCost: 0.50, isSpecial: true },
  { id: 'manzana', name: 'Manzana canela', extraCost: 0, isSpecial: false },
  { id: 'choco', name: 'Chocolate', extraCost: 0.25, isSpecial: true },
  // ⚠️ Aquí agregaremos el resto cuando tengas la imagen del menú
]

export const PRICES = {
  caja_4: 5.00,
  caja_6: 7.00,
  individual: 1.25,
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