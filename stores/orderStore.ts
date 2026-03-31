import { create } from 'zustand'
import { Order, OrderItem, DeliveryType, PaymentMethod, Shift } from '@/types'

interface OrderStore {
  order: Partial<Order>
  currentStep: number
  setStep: (step: number) => void
  setDelivery: (date: string, shift: Shift) => void
  setItems: (items: OrderItem[]) => void
  setPayment: (method: PaymentMethod, type: DeliveryType, address?: string) => void
  setCustomer: (name: string, phone: string, contact: string, notes?: string) => void
  setTotal: (total: number) => void
  resetOrder: () => void
}

const initialOrder: Partial<Order> = {}

export const useOrderStore = create<OrderStore>((set) => ({
  order: initialOrder,
  currentStep: 1,

  setStep: (step) => set({ currentStep: step }),

  setDelivery: (date, shift) =>
    set((s) => ({ order: { ...s.order, deliveryDate: date, deliveryShift: shift } })),

  setItems: (items) =>
    set((s) => ({ order: { ...s.order, items } })),

  setPayment: (method, type, address) =>
    set((s) => ({ order: { ...s.order, paymentMethod: method, deliveryType: type, deliveryAddress: address } })),

  setCustomer: (name, phone, contact, notes) =>
    set((s) => ({ order: { ...s.order, customerName: name, phone, contactInfo: contact, notes } })),

  setTotal: (total) =>
    set((s) => ({ order: { ...s.order, totalPrice: total } })),

  resetOrder: () => set({ order: initialOrder, currentStep: 1 }),
}))