'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { useOrderStore } from '@/stores/orderStore'
import { Shift } from '@/types'
import { TIME_SLOTS } from '@/constants/delivery'

interface SlotInfo {
  max: number
  current: number
}

interface DailyConfig {
  id: string
  date: string
  dayOfWeek: string
  morningAvailable: boolean
  afternoonAvailable: boolean
  maxRolls: number
  currentRolls: number
  isOpen: boolean
  slots: Record<string, SlotInfo>
}

export default function SchedulePage() {
  const router = useRouter()
  const { setDelivery, setStep } = useOrderStore()
  const [configs, setConfigs] = useState<DailyConfig[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<Shift | ''>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        setConfigs(data)
        setLoading(false)
      })
  }, [])

  const selectedConfig = configs.find((c) => c.date === selectedDate)

  const col1 = TIME_SLOTS.filter((s) => s.column === 1)
  const col2 = TIME_SLOTS.filter((s) => s.column === 2)

  function getSlotInfo(key: string): SlotInfo {
    return selectedConfig?.slots?.[key] ?? { max: 0, current: 0 }
  }

  function isSlotFull(key: string): boolean {
    const slot = getSlotInfo(key)
    return slot.current >= slot.max
  }

  function handleContinue() {
    if (!selectedDate || !selectedSlot) return
    setDelivery(selectedDate, selectedSlot as Shift)
    setStep(2)
    router.push('/order/type')
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-EC', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  function getDayEmoji(dayOfWeek: string) {
    const lower = dayOfWeek?.toLowerCase() ?? ''
    if (lower.includes('lunes')) return '🌱'
    if (lower.includes('mi')) return '✨'
    if (lower.includes('s')) return '🎉'
    return '📅'
  }

  const isDateFull = (config: DailyConfig) => {
    return config.currentRolls >= config.maxRolls
  }

  return (
    <WizardLayout
      step={1}
      totalSteps={7}
      title="¿Cuándo lo quieres?"
      showBack={false}
    >
      <div className="space-y-8">

        {/* Selección de fecha */}
        <div>
          <p className="text-base font-bold text-[#6B2D0E] mb-1">
            Elige el día de entrega
          </p>
          <p className="text-xs text-[#C45C26]/70 mb-4">
            Solo mostramos los días con disponibilidad
          </p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#C45C26]/10 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">😔</span>
              <p className="text-[#8B4513] font-semibold mt-3">
                No hay días disponibles por ahora
              </p>
              <p className="text-sm text-[#C45C26]/60 mt-1">
                Escríbenos por WhatsApp para coordinar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => {
                const isSelected = selectedDate === config.date
                const isFull = isDateFull(config)

                return (
                  <button
                    key={config.date}
                    disabled={isFull}
                    onClick={() => {
                      setSelectedDate(config.date)
                      setSelectedSlot('')
                    }}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left active:scale-95
                      ${isSelected
                        ? 'border-[#C45C26] bg-[#C45C26] text-white shadow-md'
                        : isFull
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-[#C45C26]/25 bg-white text-[#6B2D0E] hover:border-[#C45C26]/60 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {isFull ? '🚫' : getDayEmoji(config.dayOfWeek)}
                      </span>
                      <span className="font-bold text-sm capitalize">
                        {formatDate(config.date)}
                      </span>
                    </div>
                    {isFull && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-500">
                        Sin disponibilidad
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Selección de horario */}
        {selectedDate && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <p className="text-base font-bold text-[#6B2D0E] mb-1">
              ¿A qué hora lo recoges?
            </p>
            <p className="text-xs text-[#C45C26]/70 mb-4">
              Los horarios en gris ya no tienen disponibilidad
            </p>

            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map(({ key, label }) => {
                const full = isSlotFull(key)
                const selected = selectedSlot === key
                return (
                  <button
                    key={key}
                    disabled={full}
                    onClick={() => setSelectedSlot(key as Shift)}
                    className={`w-full py-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 active:scale-95
                      ${selected
                        ? 'border-[#C45C26] bg-[#C45C26] text-white shadow-md'
                        : full
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                        : 'border-[#C45C26]/25 bg-white text-[#6B2D0E] hover:border-[#C45C26]/60'
                      }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* Acordar */}
            <button
              onClick={() => setSelectedSlot('acordar')}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left active:scale-95 mt-2
                ${selectedSlot === 'acordar'
                  ? 'border-[#C45C26] bg-[#C45C26] text-white shadow-md'
                  : 'border-[#C45C26]/25 bg-white text-[#6B2D0E] hover:border-[#C45C26]/60'
                }`}
            >
              <span className="text-2xl">💬</span>
              <span className="font-bold text-sm">Prefiero elegir otro horario</span>
            </button>
          </div>
        )}

        {/* Botón continuar */}
        <button
          disabled={!selectedDate || !selectedSlot}
          onClick={handleContinue}
          className="w-full bg-[#C45C26] hover:bg-[#A34820] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md disabled:shadow-none"
        >
          Continuar →
        </button>

      </div>
    </WizardLayout>
  )
}