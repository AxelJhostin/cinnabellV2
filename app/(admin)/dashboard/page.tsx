'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { generateDayPDF } from '@/lib/pdf/generator'
import { OrderCard, Order } from '@/components/admin/OrderCard'
import { FlavorTab } from '@/components/admin/FlavorTab'
import { StatsTab } from '@/components/admin/StatsTab'
import { ConfigTab, DailyConfig } from '@/components/admin/ConfigTab'

export default function DashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'pedidos' | 'sabores' | 'stats' | 'config'>('pedidos')
  const [configs, setConfigs] = useState<DailyConfig[]>([])

  async function checkAuth() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.replace('/login')
  }

  function loadOrders() {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((data) => setOrders(data))
      .finally(() => setLoading(false))
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
          slots: d.slots ?? {},
        }))
        setConfigs(mapped)
      })
  }

  useEffect(() => {
    checkAuth()
    loadOrders()
    loadConfigs()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    loadOrders()
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

  async function createDay(date: string, maxRolls: number) {
    const dateObj = new Date(date + 'T12:00:00')
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
    const dayOfWeek = days[dateObj.getDay()]
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, dayOfWeek, maxRolls }),
    })
    loadConfigs()
  }

  const dates = [...new Set(orders.map((o) => o.delivery_date))].sort()
  const activeDate = selectedDate || dates[0] || ''
  const filtered = orders.filter((o) => o.delivery_date === activeDate)

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })
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

      {/* Contenido */}
      <div className="flex-1 px-4 pb-6 space-y-3">
        {loading ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-[#C45C26]/10" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'pedidos' && (
              <>
                {filtered.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl">📭</span>
                    <p className="text-[#8B4513] font-semibold mt-3">No hay pedidos para este día</p>
                  </div>
                ) : filtered.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isExpanded={expandedId === order.id}
                    onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </>
            )}

            {tab === 'sabores' && (
              <FlavorTab
                filtered={filtered}
                activeDate={activeDate}
                formatDate={formatDate}
              />
            )}

            {tab === 'stats' && (
              <StatsTab orders={orders} />
            )}

            {tab === 'config' && (
              <ConfigTab
                configs={configs}
                onUpdateConfig={updateConfig}
                onCreateDay={createDay}
                formatDate={formatDate}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}