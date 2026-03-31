'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CONTAINER_LABELS } from '@/constants/products'
import { SHIFTS } from '@/constants/delivery'

interface OrderItem {
  id: string
  container_type: string
  quantity: number
  flavors: { flavorId: string; flavorName: string; count: number }[]
  subtotal: number
}

interface Order {
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

export default function DashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'pedidos' | 'sabores' | 'stats'>('pedidos')

  async function checkAuth() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.replace('/login')
  }

  useEffect(() => {
    checkAuth()
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data))
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const dates = [...new Set(orders.map((o) => o.delivery_date))].sort()
  const activeDate = selectedDate || dates[0] || ''
  const filtered = orders.filter((o) => o.delivery_date === activeDate)

  // Sabores por turno
  const flavorsByShift: Record<string, Record<string, number>> = {
    manana: {},
    tarde: {},
    acordar: {},
  }
  filtered.forEach((order) => {
    const shift = order.delivery_shift
    if (!flavorsByShift[shift]) flavorsByShift[shift] = {}
    order.order_items.forEach((item) => {
      item.flavors.forEach((f) => {
        flavorsByShift[shift][f.flavorName] = (flavorsByShift[shift][f.flavorName] ?? 0) + f.count
      })
    })
  })

  // Total sabores del día
  const flavorTotals: Record<string, number> = {}
  filtered.forEach((order) => {
    order.order_items.forEach((item) => {
      item.flavors.forEach((f) => {
        flavorTotals[f.flavorName] = (flavorTotals[f.flavorName] ?? 0) + f.count
      })
    })
  })

  // Stats generales
  const totalRevenue = orders.reduce((acc, o) => acc + o.total_price, 0)
  const allFlavors: Record<string, number> = {}
  orders.forEach((o) => o.order_items.forEach((item) =>
    item.flavors.forEach((f) => {
      allFlavors[f.flavorName] = (allFlavors[f.flavorName] ?? 0) + f.count
    })
  ))
  const topFlavors = Object.entries(allFlavors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  function getTotalRolls(order: Order) {
    return order.order_items.reduce((acc, item) => {
      const cap = item.container_type === 'caja_4' ? 4 : item.container_type === 'caja_6' ? 6 : 1
      return acc + item.quantity * cap
    }, 0)
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#C45C26] px-4 pt-4 pb-3 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white font-black text-lg">🥐 Cinnabell Admin</h1>
            <p className="text-white/70 text-xs">Panel de pedidos</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/80 text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full"
          >
            Salir
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/10 rounded-2xl p-1">
          {([
            { key: 'pedidos', label: 'Pedidos' },
            { key: 'sabores', label: 'Sabores' },
            { key: 'stats', label: 'Stats' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all
                ${tab === key ? 'bg-white text-[#C45C26]' : 'text-white/80'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de fecha */}
      {tab !== 'stats' && (
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {dates.length === 0 ? (
              <p className="text-xs text-[#C45C26]/60 py-2">No hay pedidos aún</p>
            ) : dates.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all
                  ${activeDate === date
                    ? 'bg-[#C45C26] text-white shadow-md'
                    : 'bg-white border border-[#C45C26]/20 text-[#6B2D0E]'
                  }`}
              >
                {formatDate(date)}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                  ${activeDate === date ? 'bg-white/20 text-white' : 'bg-[#C45C26]/10 text-[#C45C26]'}`}>
                  {orders.filter((o) => o.delivery_date === date).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 px-4 pb-6 space-y-3">
        {loading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-[#C45C26]/10" />
            ))}
          </div>
        ) : (
          <>
            {/* TAB: PEDIDOS */}
            {tab === 'pedidos' && (
              <>
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl">📭</span>
                    <p className="text-[#8B4513] font-semibold mt-3">No hay pedidos para este día</p>
                  </div>
                ) : filtered.map((order) => {
                  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pendiente
                  const isExpanded = expandedId === order.id
                  const totalRolls = getTotalRolls(order)

                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-[#C45C26]/15 overflow-hidden shadow-sm">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
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
                            {SHIFTS[order.delivery_shift as keyof typeof SHIFTS]?.split('(')[0].trim()}
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
                              onClick={() => updateStatus(order.id, status.next)}
                              className="w-full bg-[#C45C26] text-white font-bold py-2.5 rounded-2xl text-sm active:scale-95 transition-all"
                            >
                              {status.nextLabel}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}

            {/* TAB: SABORES */}
            {tab === 'sabores' && (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-[#C45C26]/60 font-semibold uppercase tracking-wide">
                  Roles a preparar — {activeDate ? formatDate(activeDate) : ''}
                </p>

                {Object.keys(flavorTotals).length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl">🥐</span>
                    <p className="text-[#8B4513] font-semibold mt-3">Sin pedidos para este día</p>
                  </div>
                ) : (
                  <>
                    {(['manana', 'tarde', 'acordar'] as const).map((shift) => {
                      const shiftFlavors = flavorsByShift[shift] ?? {}
                      if (Object.keys(shiftFlavors).length === 0) return null
                      const shiftLabels = {
                        manana: '🌅 Mañana',
                        tarde: '🌇 Tarde',
                        acordar: '💬 A coordinar',
                      }
                      return (
                        <div key={shift}>
                          <p className="text-sm font-black text-[#6B2D0E] mb-2">{shiftLabels[shift]}</p>
                          <div className="space-y-2">
                            {Object.entries(shiftFlavors)
                              .sort((a, b) => b[1] - a[1])
                              .map(([name, count]) => (
                                <div key={name} className="bg-white rounded-2xl border border-[#C45C26]/15 px-4 py-3 flex items-center justify-between">
                                  <span className="font-bold text-[#6B2D0E] text-sm">{name}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-[#C45C26]/10 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-[#C45C26] rounded-full"
                                        style={{ width: `${Math.min(100, (count / Math.max(...Object.values(shiftFlavors))) * 100)}%` }}
                                      />
                                    </div>
                                    <span className="font-black text-[#C45C26] text-lg w-6 text-right">{count}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )
                    })}

                    <div className="bg-[#C45C26] rounded-2xl px-4 py-3 flex justify-between items-center">
                      <span className="text-white font-bold text-sm">Total roles del día</span>
                      <span className="text-white font-black text-xl">
                        {Object.values(flavorTotals).reduce((a, b) => a + b, 0)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB: STATS */}
            {tab === 'stats' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total pedidos', value: orders.length, emoji: '📋' },
                    { label: 'Ingresos totales', value: `$${totalRevenue.toFixed(2)}`, emoji: '💰' },
                    { label: 'Pendientes', value: orders.filter((o) => o.status === 'pendiente').length, emoji: '⏳' },
                    { label: 'Entregados', value: orders.filter((o) => o.status === 'entregado').length, emoji: '✅' },
                  ].map(({ label, value, emoji }) => (
                    <div key={label} className="bg-white rounded-2xl border border-[#C45C26]/15 px-4 py-4">
                      <span className="text-2xl">{emoji}</span>
                      <p className="font-black text-[#C45C26] text-2xl mt-1">{value}</p>
                      <p className="text-xs text-[#8B4513] font-medium">{label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-[#C45C26]/60 font-bold uppercase tracking-wide mb-2">
                    Sabores más vendidos
                  </p>
                  <div className="space-y-2">
                    {topFlavors.length === 0 ? (
                      <p className="text-xs text-[#C45C26]/40 text-center py-4">Sin datos aún</p>
                    ) : topFlavors.map(([name, count], i) => (
                      <div key={name} className="bg-white rounded-2xl border border-[#C45C26]/15 px-4 py-3 flex items-center gap-3">
                        <span className="font-black text-[#C45C26]/40 text-lg w-6">#{i + 1}</span>
                        <span className="flex-1 font-bold text-[#6B2D0E] text-sm">{name}</span>
                        <span className="font-black text-[#C45C26]">{count} roles</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}