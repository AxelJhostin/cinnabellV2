export type ContainerType = 'caja_4' | 'caja_6' | 'individual'
export type DeliveryType = 'retiro' | 'envio'
export type PaymentMethod = 'efectivo' | 'transferencia'
export type OrderStatus = 'pendiente' | 'confirmado' | 'listo' | 'entregado'
export type Shift = 'manana' | 'tarde' | 'acordar'

export interface Flavor {
  id: string
  name: string
  extraCost: number
  isSpecial: boolean
}

export interface OrderItem {
  id: string
  containerType: ContainerType
  quantity: number
  flavors: { flavorId: string; flavorName: string; count: number }[]
  unitPrice: number
  subtotal: number
}

export interface Order {
  id?: string
  orderNumber?: number
  createdAt?: string
  customerName: string
  phone: string
  contactInfo: string
  deliveryDate: string
  deliveryShift: Shift
  deliveryType: DeliveryType
  deliveryAddress?: string
  paymentMethod: PaymentMethod
  totalPrice: number
  notes?: string
  status?: OrderStatus
  items: OrderItem[]
}

export interface DailyConfig {
  id: string
  date: string
  dayOfWeek: string
  morningAvailable: boolean
  afternoonAvailable: boolean
  maxRolls: number
  currentRolls: number
  isOpen: boolean
}