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

export function ConfigTab({ configs, onUpdateConfig, onCreateDay, formatDate }: Props) {
  const [newDate, setNewDate] = useState('')
  const [newMaxRolls, setNewMaxRolls] = useState('50')
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!newDate) return
    setSaving(true)
    await onCreateDay(newDate, parseInt(newMaxRolls))
    setNewDate('')
    setNewMaxRolls('50')
    setSaving(false)
  }

  return (
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
          onClick={handleCreate}
          disabled={!newDate || saving}
          className="w-full bg-[#C45C26] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-3 rounded-full text-sm transition-all active:scale-95"
        >
          {saving ? 'Guardando...' : 'Agregar día'}
        </button>
      </div>

      {/* Días existentes */}
      <div>
        <p className="text-xs text-[#C45C26]/60 font-bold uppercase tracking-wide mb-3">
          Días configurados
        </p>
        <div className="space-y-3">
          {configs.length === 0 ? (
            <p className="text-xs text-[#C45C26]/40 text-center py-4">No hay días configurados</p>
          ) : configs.map((config) => (
            <div key={config.id} className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-3 space-y-3">

              {/* Header */}
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

              {/* Slots */}
              <div>
                <p className="text-xs font-bold text-[#8B4513] mb-2">Disponibilidad por horario</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(config.slots ?? {}).map(([time, slot]) => {
                    const isFull = slot.current >= slot.max
                    return (
                      <div
                        key={time}
                        className={`px-2 py-1.5 rounded-xl text-xs font-semibold text-center
                          ${isFull ? 'bg-red-100 text-red-600' : 'bg-green-50 text-green-700'}`}
                      >
                        <p>{TIME_LABELS[time] ?? time}</p>
                        <p className="font-bold">{slot.current}/{slot.max}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Máximo de roles */}
              <div className="flex items-center justify-between">
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
  )
}