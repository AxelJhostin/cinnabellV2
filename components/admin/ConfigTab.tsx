'use client'

import { useState } from 'react'

export interface DailyConfig {
  id: string
  date: string
  day_of_week: string
  morning_available: boolean
  afternoon_available: boolean
  max_rolls: number
  current_rolls: number
  is_open: boolean
  slots: Record<string, { max: number; current: number }>
}

const TIME_LABELS: Record<string, string> = {
  '12:00': '12:00pm', '12:30': '12:30pm',
  '13:00': '1:00pm',  '13:30': '1:30pm',
  '15:00': '3:00pm',  '15:30': '3:30pm',
  '16:00': '4:00pm',  '16:30': '4:30pm',
  '17:00': '5:00pm',  '17:30': '5:30pm',
}

interface Props {
  configs: DailyConfig[]
  onUpdateConfig: (id: string, changes: Partial<DailyConfig>) => void
  onCreateDay: (date: string, maxRolls: number) => Promise<void>
  formatDate: (date: string) => string
}

function InfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-3xl px-6 py-6 max-w-sm w-full shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[#6B2D0E] text-lg">¿Cómo funciona?</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#C45C26]/10 flex items-center justify-center text-[#C45C26] font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-[#F5ECD7] rounded-2xl px-4 py-3">
            <p className="font-bold text-[#6B2D0E] text-sm mb-1">🎯 Límite del día</p>
            <p className="text-xs text-[#8B4513] leading-relaxed">
              Es el total de roles que pueden producir ese día. Cuando se alcanza, el día se cierra automáticamente para nuevos pedidos.
            </p>
          </div>

          <div className="bg-[#F5ECD7] rounded-2xl px-4 py-3">
            <p className="font-bold text-[#6B2D0E] text-sm mb-1">🕐 Límite por horario</p>
            <p className="text-xs text-[#8B4513] leading-relaxed">
              Cada horario tiene un máximo de roles para no sobrecargarse en una sola franja. Cuando un horario se llena, los clientes deben elegir otro disponible.
            </p>
          </div>

          <div className="bg-[#F5ECD7] rounded-2xl px-4 py-3">
            <p className="font-bold text-[#6B2D0E] text-sm mb-1">✏️ ¿Se puede modificar?</p>
            <p className="text-xs text-[#8B4513] leading-relaxed">
              Sí. Puedes ajustar el límite de cada horario tocando − o + junto a cada hora. También puedes cambiar el total del día desde Máx. roles del día.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="text-xs text-amber-800 leading-relaxed">
              💡 <strong>Consejo:</strong> Los horarios del mediodía suelen llenarse primero. Si quieres distribuir mejor, sube el límite de las horas de la tarde.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ConfigTab({ configs, onUpdateConfig, onCreateDay, formatDate }: Props) {
  const [newDate, setNewDate] = useState('')
  const [newMaxRolls, setNewMaxRolls] = useState('60')
  const [saving, setSaving] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null)

  async function handleCreate() {
    if (!newDate) return
    setSaving(true)
    await onCreateDay(newDate, parseInt(newMaxRolls))
    setNewDate('')
    setNewMaxRolls('60')
    setSaving(false)
  }

  async function updateSlotMax(configId: string, slot: string, currentMax: number, delta: number) {
    const newMax = Math.max(1, currentMax + delta)
    setUpdatingSlot(`${configId}-${slot}`)
    await fetch(`/api/config/${configId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot, max: newMax }),
    })
    setUpdatingSlot(null)
    onUpdateConfig(configId, {})
  }

  return (
    <>
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}

      <div className="space-y-5 pt-1">

        {/* Agregar nuevo día */}
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
              Máximo de roles del día
            </label>
            <input
              type="number"
              value={newMaxRolls}
              onChange={(e) => setNewMaxRolls(e.target.value)}
              min={10}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium focus:outline-none focus:border-[#C45C26] transition-colors"
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={!newDate || saving}
            className="w-full bg-[#C45C26] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95"
          >
            {saving ? 'Guardando...' : 'Agregar día'}
          </button>
        </div>

        {/* Días configurados */}
        <div>
          {/* Header con botón de info */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#C45C26]/60 font-bold uppercase tracking-wide">
              Días configurados
            </p>
            <button
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-1.5 text-xs text-[#C45C26] font-semibold bg-[#C45C26]/10 px-3 py-1.5 rounded-full"
            >
              <span>ℹ️</span>
              <span>¿Cómo funciona?</span>
            </button>
          </div>

          <div className="space-y-3">
            {configs.length === 0 ? (
              <p className="text-xs text-[#C45C26]/40 text-center py-4">No hay días configurados</p>
            ) : configs.map((config) => (
              <div key={config.id} className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-3 space-y-3">

                {/* Header del día */}
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
                    onClick={() => onUpdateConfig(config.id, { is_open: !config.is_open })}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all
                      ${config.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                  >
                    {config.is_open ? 'Abierto' : 'Cerrado'}
                  </button>
                </div>

                {/* Slots por horario */}
                <div>
                  <p className="text-xs font-bold text-[#8B4513] mb-2">Límite por horario</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(config.slots ?? {})
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([time, slot]) => {
                        const isFull = slot.current >= slot.max
                        const isUpdating = updatingSlot === `${config.id}-${time}`
                        return (
                          <div
                            key={time}
                            className={`rounded-xl border px-2 py-2 transition-all
                              ${isFull ? 'border-red-200 bg-red-50' : 'border-[#C45C26]/15 bg-[#F5ECD7]/40'}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-[#6B2D0E]">
                                {TIME_LABELS[time] ?? time}
                              </span>
                              <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-[#C45C26]/60'}`}>
                                {slot.current}/{slot.max}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#8B4513]/60">máx:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateSlotMax(config.id, time, slot.max, -1)}
                                  disabled={isUpdating || slot.max <= 1}
                                  className="w-5 h-5 rounded-full border border-[#C45C26]/30 flex items-center justify-center text-[#C45C26] text-xs font-bold disabled:opacity-30"
                                >
                                  −
                                </button>
                                <span className="font-black text-[#6B2D0E] text-sm w-4 text-center">
                                  {isUpdating ? '…' : slot.max}
                                </span>
                                <button
                                  onClick={() => updateSlotMax(config.id, time, slot.max, 1)}
                                  disabled={isUpdating}
                                  className="w-5 h-5 rounded-full bg-[#C45C26] flex items-center justify-center text-white text-xs font-bold disabled:opacity-30"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Máximo total del día */}
                <div className="flex items-center justify-between pt-1 border-t border-[#C45C26]/10">
                  <span className="text-xs font-bold text-[#8B4513]">Máx. roles del día</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateConfig(config.id, { max_rolls: Math.max(10, config.max_rolls - 5) })}
                      className="w-7 h-7 rounded-full border-2 border-[#C45C26]/30 flex items-center justify-center font-bold text-[#C45C26] text-sm active:scale-90"
                    >
                      −
                    </button>
                    <span className="font-black text-[#6B2D0E] w-8 text-center">{config.max_rolls}</span>
                    <button
                      onClick={() => onUpdateConfig(config.id, { max_rolls: config.max_rolls + 5 })}
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
    </>
  )
}