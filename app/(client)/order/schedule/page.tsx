'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { useOrderStore } from '@/stores/orderStore'
import { DailyConfig, Shift } from '@/types'
import { SHIFTS } from '@/constants/delivery'

export default function SchedulePage() {
  const router = useRouter()
  const { setDelivery, setStep } = useOrderStore()
  const [configs, setConfigs] = useState<DailyConfig[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedShift, setSelectedShift] = useState<Shift | ''>('')
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

  const availableShifts = selectedConfig
    ? [
        ...(selectedConfig.morningAvailable
          ? [{ key: 'manana' as Shift, label: SHIFTS.manana, emoji: '🌅' }]
          : []),
        ...(selectedConfig.afternoonAvailable
          ? [{ key: 'tarde' as Shift, label: SHIFTS.tarde, emoji: '🌇' }]
          : []),
        { key: 'acordar' as Shift, label: SHIFTS.acordar, emoji: '💬' },
      ]
    : []

  function handleContinue() {
    if (!selectedDate || !selectedShift) return
    setDelivery(selectedDate, selectedShift as Shift)
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
    const map: Record<string, string> = {
      lunes: '🌱', miércoles: '✨', sábado: '🎉'
    }
    return map[dayOfWeek] ?? '📅'
  }

  return (
    <WizardLayout
      step={1}
      totalSteps={7}
      title="¿Cuándo lo quieres?"
      showBack={false}
    >
      <div className="space-y-8">

        {/* Sección fecha */}
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
                const spots = config.maxRolls - config.currentRolls
                const isSelected = selectedDate === config.date
                const isFull = spots <= 0

                return (
                  <button
                    key={config.date}
                    disabled={isFull}
                    onClick={() => {
                      setSelectedDate(config.date)
                      setSelectedShift('')
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
                    <span className={`text-xs font-bold px-3 py-1 rounded-full
                      ${isSelected
                        ? 'bg-white/20 text-white'
                        : isFull
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-[#C45C26]/10 text-[#C45C26]'
                      }`}>
                      {isFull ? 'Lleno' : `${spots} roles`}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Sección turno */}
        {selectedDate && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <p className="text-base font-bold text-[#6B2D0E] mb-1">
              ¿En qué turno?
            </p>
            <p className="text-xs text-[#C45C26]/70 mb-4">
              Elige el horario que más te convenga
            </p>
            <div className="space-y-3">
              {availableShifts.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => setSelectedShift(key)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left active:scale-95
                    ${selectedShift === key
                      ? 'border-[#C45C26] bg-[#C45C26] text-white shadow-md'
                      : 'border-[#C45C26]/25 bg-white text-[#6B2D0E] hover:border-[#C45C26]/60'
                    }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="font-bold text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón continuar */}
        <button
          disabled={!selectedDate || !selectedShift}
          onClick={handleContinue}
          className="w-full bg-[#C45C26] hover:bg-[#A34820] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md disabled:shadow-none"
        >
          Continuar →
        </button>

      </div>
    </WizardLayout>
  )
}