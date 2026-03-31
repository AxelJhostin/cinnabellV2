'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CONTAINER_LABELS } from '@/constants/products'
import { SHIFTS } from '@/constants/delivery'
import { generateDayPDF } from '@/lib/pdf/generator'

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

interface DailyConfig {
  id: string
  date: string
  day_of_week: string
  morning_available: boolean
  afternoon_available: boolean
  max_rolls: number
  current_rolls: number
  is_open: boolean
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
  const [tab, setTab] = useState<'pedidos' | 'sabores' | 'stats' | 'config'>('pedidos')
  const [configs, setConfigs] = useState<DailyConfig[]>([])
  const [newDate, setNewDate] = useState('')
  const [newMaxRolls, setNewMaxRolls] = useState('50')
  const [savingConfig, setSavingConfig] = useState(false)

  async function checkAuth() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.replace('/login')
  }

  function loadConfigs() {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        const mapped = data.map((d: DailyConfig & {
          dayOfWeek?: string
          morningAvailable?: boolean
          afternoonAvailable?: boolean
          maxRolls?: number
          currentRolls?: number
          isOpen?: boolean
        }) => ({
          id: d.id,
          date: d.date,
          day_of_week: d.day_of_week ?? d.dayOfWeek,
          morning_available: d.morning_available ?? d.morningAvailable,
          afternoon_available: d.afternoon_available ?? d.afternoonAvailable,
          max_rolls: d.max_rolls ?? d.maxRolls,
          current_rolls: d.current_rolls ?? d.currentRolls,
          is_open: d.is_open ?? d.isOpen,
        }))
        setConfigs(mapped)
      })
  }

  useEffect(() => {
    checkAuth()
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data))
      .finally(() => setLoading(false))
    loadConfigs()
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

  async function updateConfig(id: string, changes: Partial<DailyConfig>) {
    const current = configs.find((c) => c.id === id)
    if (!current) return

    const merged = { ...current, ...changes }

    await fetch(`/api/config/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        morningAvailable: merged.morning_available,
        afternoonAvailable: merged.afternoon_available,
        maxRolls: merged.max_rolls,
        isOpen: merged.is_open,
      }),
    })
    loadConfigs()
  }

  async function createDay() {
    if (!newDate) return
    setSavingConfig(true)
    const date = new Date(newDate + 'T12:00:00')
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const dayOfWeek = days[date.getDay()]

    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: newDate,
        dayOfWeek,
        maxRolls: parseInt(newMaxRolls),
      }),
    })

    setNewDate('')
    setNewMaxRolls('50')
    setSavingConfig(false)
    loadConfigs()
  }

  const dates = [...new Set(orders.map((o) => o.delivery_date))].sort()
  const activeDate = selectedDate || dates[0] || ''
  const filtered = orders.filter((o) => o.delivery_date === activeDate)

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

  const flavorTotals: Record<string, number> = {}
  filtered.forEach((order) => {
    order.order_items.forEach((item) => {
      item.flavors.forEach((f) => {
        flavorTotals[f.flavorName] = (flavorTotals[f.flavorName] ?? 0) + f.count
      })
    })
  })

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

  function handleExportPDF() {
  generateDayPDF(filtered, activeDate)
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

        <div className="flex gap-1 bg-white/10 rounded-2xl p-1">
          {([
            { key: 'pedidos', label: 'Pedidos' },
            { key: 'sabores', label: 'Sabores' },
            { key: 'stats', label: 'Stats' },
            { key: 'config', label: '⚙️' },
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
      {tab !== 'stats' && tab !== 'config' && (
        <>
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

          {tab === 'pedidos' && filtered.length > 0 && (
            <div className="px-4 pb-2">
              <button
                onClick={handleExportPDF}
                className="w-full bg-white border-2 border-[#C45C26]/30 text-[#C45C26] font-bold py-2.5 rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-95 transition-all hover:border-[#C45C26]"
              >
                <span>🖨️</span>
                <span>Exportar PDF del día</span>
              </button>
            </div>
          )}
        </>
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

            {/* TAB: CONFIG */}
            {tab === 'config' && (
              <div className="space-y-5 pt-1">

                <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-4 space-y-3">
                  <p className="text-sm font-black text-[#6B2D0E]">Agregar día de entrega</p>

                  <div>
                    <label className="text-xs font-bold text-[#8B4513] uppercase tracking-wide mb-1.5 block">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium focus:outline-none focus:border-[#C45C26] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#8B4513] uppercase tracking-wide mb-1.5 block">
                      Máximo de roles
                    </label>
                    <input
                      type="number"
                      value={newMaxRolls}
                      onChange={(e) => setNewMaxRolls(e.target.value)}
                      min={1}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium focus:outline-none focus:border-[#C45C26] transition-colors"
                    />
                  </div>

                  <button
                    onClick={createDay}
                    disabled={!newDate || savingConfig}
                    className="w-full bg-[#C45C26] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95"
                  >
                    {savingConfig ? 'Guardando...' : 'Agregar día'}
                  </button>
                </div>

                <div>
                  <p className="text-xs text-[#C45C26]/60 font-bold uppercase tracking-wide mb-3">
                    Días configurados
                  </p>
                  <div className="space-y-3">
                    {configs.length === 0 ? (
                      <p className="text-xs text-[#C45C26]/40 text-center py-4">No hay días configurados</p>
                    ) : configs.map((config) => (
                      <div key={config.id} className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-3 space-y-3">

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-[#6B2D0E] text-sm capitalize">
                              {config.day_of_week} — {formatDate(config.date)}
                            </p>
                            <p className="text-xs text-[#C45C26]/60">
                              {config.current_rolls ?? 0}/{config.max_rolls} roles reservados
                            </p>
                          </div>
                          <button
                            onClick={() => updateConfig(config.id, { is_open: !config.is_open })}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all
                              ${config.is_open
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                              }`}
                          >
                            {config.is_open ? 'Abierto' : 'Cerrado'}
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => updateConfig(config.id, { morning_available: !config.morning_available })}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                              ${config.morning_available
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-400 line-through'
                              }`}
                          >
                            🌅 Mañana
                          </button>
                          <button
                            onClick={() => updateConfig(config.id, { afternoon_available: !config.afternoon_available })}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
                              ${config.afternoon_available
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-400 line-through'
                              }`}
                          >
                            🌇 Tarde
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#8B4513]">Máx. roles</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateConfig(config.id, { max_rolls: Math.max(1, config.max_rolls - 5) })}
                              className="w-7 h-7 rounded-full border-2 border-[#C45C26]/30 flex items-center justify-center font-bold text-[#C45C26] text-sm active:scale-90"
                            >
                              −
                            </button>
                            <span className="font-black text-[#6B2D0E] w-8 text-center">{config.max_rolls}</span>
                            <button
                              onClick={() => updateConfig(config.id, { max_rolls: config.max_rolls + 5 })}
                              className="w-7 h-7 rounded-full bg-[#C45C26] flex items-center justify-center font-bold text-white text-sm active:scale-90"
                            >
                              +
                            </button>
                          </div>
                        </div>

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