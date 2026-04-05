'use client'

import { CONTAINER_LABELS } from '@/constants/products'
import { SHIFTS } from '@/constants/delivery'

interface OrderItem {
  id: string
  container_type: string
  quantity: number
  flavors: { flavorId: string; flavorName: string; count: number }[]
  subtotal: number
}

export interface Order {
  id: string
  order_number: number
  created_at: string
  customer_name: string
  phone: string
  contact_info: string
  delivery_date: string
  delivery_shift: string
  delivery_type: string
  delivery_address?: string
  payment_method: string
  total_price: number
  notes?: string
  status: string
  order_items: OrderItem[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; next: string; nextLabel: string }> = {
  pendiente:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-800', next: 'confirmado', nextLabel: 'Confirmar' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800',    next: 'listo',      nextLabel: 'Marcar listo' },
  listo:      { label: 'Listo',      color: 'bg-green-100 text-green-800',  next: 'entregado',  nextLabel: 'Marcar entregado' },
  entregado:  { label: 'Entregado',  color: 'bg-gray-100 text-gray-600',    next: '',           nextLabel: '' },
}

interface Props {
  order: Order
  isExpanded: boolean
  onToggle: () => void
  onUpdateStatus: (id: string, status: string) => void
}

export function OrderCard({ order, isExpanded, onToggle, onUpdateStatus }: Props) {
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pendiente

  const totalRolls = order.order_items.reduce((acc, item) => {
    const cap = item.container_type === 'caja_4' ? 4 : item.container_type === 'caja_6' ? 6 : 1
    return acc + item.quantity * cap
  }, 0)

  return (
    <div className="bg-white rounded-2xl border border-[#C45C26]/15 overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-[#C45C26] text-sm">
              #{String(order.order_number).padStart(4, '0')}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
          <span className="font-black text-[#C45C26]">
            ${order.total_price.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="font-bold text-[#6B2D0E] text-sm">{order.customer_name}</p>
          <p className="text-xs text-[#C45C26]/60">
            {SHIFTS[order.delivery_shift as keyof typeof SHIFTS]?.toString().split('(')[0].trim() ?? order.delivery_shift}
          </p>
        </div>
        <p className="text-xs text-[#C45C26]/50 mt-0.5">
          {totalRolls} roles ·{' '}
          {order.delivery_type === 'envio' ? '🛵 Envío' : '🏪 Retiro'} ·{' '}
          {order.payment_method === 'transferencia' ? '📲 Transferencia' : '💵 Efectivo'}
        </p>
      </button>

      {isExpanded && (
        <div className="border-t border-[#C45C26]/10 px-4 py-3 space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-[#C45C26]/60 font-bold uppercase tracking-wide">Contacto</p>
            <p className="text-sm text-[#6B2D0E] font-medium">📱 {order.phone}</p>
            <p className="text-sm text-[#6B2D0E] font-medium">📸 {order.contact_info}</p>
            {order.delivery_address && (
              <p className="text-sm text-[#6B2D0E] font-medium">📍 {order.delivery_address}</p>
            )}
          </div>

          <div>
            <p className="text-xs text-[#C45C26]/60 font-bold uppercase tracking-wide mb-2">Pedido</p>
            {order.order_items.map((item) => (
              <div key={item.id} className="mb-2">
                <p className="text-sm font-bold text-[#6B2D0E]">
                  {item.quantity}x {CONTAINER_LABELS[item.container_type] ?? item.container_type}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.flavors.map((f) => (
                    <span key={f.flavorId} className="text-xs bg-[#C45C26]/10 text-[#C45C26] px-2 py-0.5 rounded-full font-semibold">
                      {f.flavorName} x{f.count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className="bg-amber-50 rounded-xl px-3 py-2">
              <p className="text-xs text-amber-800 font-medium">📝 {order.notes}</p>
            </div>
          )}

          {status.next && (
            <button
              onClick={() => onUpdateStatus(order.id, status.next)}
              className="w-full bg-[#C45C26] text-white font-bold py-2.5 rounded-2xl text-sm active:scale-95 transition-all"
            >
              {status.nextLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}