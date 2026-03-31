import { Flavor } from '@/types'

export const FLAVORS: Flavor[] = [
  { id: 'clasico', name: 'Clásico', extraCost: 0, isSpecial: false },
  { id: 'oreo', name: 'Oreo', extraCost: 0.50, isSpecial: true },
  { id: 'pistacho', name: 'Pistacho', extraCost: 0.50, isSpecial: true },
  { id: 'manjar_nueces', name: 'Manjar y Nueces', extraCost: 0.50, isSpecial: true },
  { id: 'choco_avellana', name: 'Choco Avellana', extraCost: 0.50, isSpecial: true },
  { id: 'frutos_rojos', name: 'Frutos Rojos', extraCost: 0.50, isSpecial: true },
  { id: 'creme_brulee', name: 'Creme Brulee', extraCost: 1.00, isSpecial: true },
  { id: 'pizza', name: 'Pizza', extraCost: 1.00, isSpecial: true },
]

export const PRICES = {
  // Miti-Miti (mitad clásicos, mitad premium)
  miti_miti_4: 5.00,
  miti_miti_6: 7.50,
  // Premium (sabores variados)
  premium_4: 6.00,
  premium_6: 9.00,
  // Individual por sabor
  individual: 1.00, // clásico
  individual_premium: 1.50, // cualquier sabor premium
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