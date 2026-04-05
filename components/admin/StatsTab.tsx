'use client'

import { Order } from './OrderCard'

interface Props {
  orders: Order[]
}

export function StatsTab({ orders }: Props) {
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

  return (
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
  )
}