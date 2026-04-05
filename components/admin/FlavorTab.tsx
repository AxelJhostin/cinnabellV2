'use client'

import { Order } from './OrderCard'

interface Props {
  filtered: Order[]
  activeDate: string
  formatDate: (date: string) => string
}

const SHIFT_LABELS: Record<string, string> = {
  '12:00': '12:00pm', '12:30': '12:30pm',
  '13:00': '1:00pm',  '13:30': '1:30pm',
  '15:00': '3:00pm',  '15:30': '3:30pm',
  '16:00': '4:00pm',  '16:30': '4:30pm',
  '17:00': '5:00pm',  '17:30': '5:30pm',
  acordar: 'A coordinar',
}

export function FlavorTab({ filtered, activeDate, formatDate }: Props) {
  const flavorsByShift: Record<string, Record<string, number>> = {}
  const flavorTotals: Record<string, number> = {}

  filtered.forEach((order) => {
    const shift = order.delivery_shift
    if (!flavorsByShift[shift]) flavorsByShift[shift] = {}
    order.order_items.forEach((item) => {
      item.flavors.forEach((f) => {
        flavorsByShift[shift][f.flavorName] = (flavorsByShift[shift][f.flavorName] ?? 0) + f.count
        flavorTotals[f.flavorName] = (flavorTotals[f.flavorName] ?? 0) + f.count
      })
    })
  })

  return (
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
          {Object.entries(flavorsByShift)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([shift, flavors]) => {
              if (Object.keys(flavors).length === 0) return null
              return (
                <div key={shift}>
                  <p className="text-sm font-black text-[#6B2D0E] mb-2">
                    🕐 {SHIFT_LABELS[shift] ?? shift}
                  </p>
                  <div className="space-y-2">
                    {Object.entries(flavors)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, count]) => (
                        <div key={name} className="bg-white rounded-2xl border border-[#C45C26]/15 px-4 py-3 flex items-center justify-between">
                          <span className="font-bold text-[#6B2D0E] text-sm">{name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-[#C45C26]/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#C45C26] rounded-full"
                                style={{ width: `${Math.min(100, (count / Math.max(...Object.values(flavors))) * 100)}%` }}
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
  )
}