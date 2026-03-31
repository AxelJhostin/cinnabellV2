'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { useOrderStore } from '@/stores/orderStore'
import { ContainerType, OrderItem } from '@/types'
import { CONTAINER_LABELS, CONTAINER_CAPACITY, ROLL_PRICES } from '@/constants/products'

interface Selection {
  containerType: ContainerType
  quantity: number
}

const OPTIONS: { type: ContainerType; emoji: string; desc: string; badge?: string }[] = [
  { type: 'caja_4', emoji: '📦', desc: '4 roles, elige los sabores que quieras', badge: 'Más pedida' },
  { type: 'caja_6', emoji: '🎁', desc: '6 roles, ideal para regalar' },
  { type: 'individual', emoji: '🥐', desc: 'La cantidad que quieras, sabor a elegir' },
]

export default function TypePage() {
  const router = useRouter()
  const { setItems, setStep } = useOrderStore()
  const [selections, setSelections] = useState<Selection[]>([])

  function isSelected(type: ContainerType) {
    return selections.some((s) => s.containerType === type)
  }

  function getQuantity(type: ContainerType) {
    return selections.find((s) => s.containerType === type)?.quantity ?? 0
  }

  function toggleType(type: ContainerType) {
    setSelections((prev) =>
      prev.some((s) => s.containerType === type)
        ? prev.filter((s) => s.containerType !== type)
        : [...prev, { containerType: type, quantity: 1 }]
    )
  }

  function updateQuantity(type: ContainerType, delta: number) {
    setSelections((prev) =>
      prev.map((s) =>
        s.containerType === type
          ? { ...s, quantity: Math.max(1, s.quantity + delta) }
          : s
      )
    )
  }

  function getTotalRolls() {
    return selections.reduce(
      (acc, s) => acc + s.quantity * CONTAINER_CAPACITY[s.containerType],
      0
    )
  }

  function handleContinue() {
    if (selections.length === 0) return

    const items: OrderItem[] = selections.map((s) => ({
      id: crypto.randomUUID(),
      containerType: s.containerType,
      quantity: s.quantity,
      flavors: [],
      unitPrice: 0, // se calcula en la vista de sabores
      subtotal: 0,
    }))

    setItems(items)
    setStep(3)
    router.push('/order/flavors')
  }

  return (
    <WizardLayout
      step={2}
      totalSteps={7}
      title="¿Qué vas a pedir?"
      onBack={() => router.back()}
    >
      <div className="space-y-6">

        <div>
          <p className="text-base font-bold text-[#6B2D0E] mb-1">
            Elige el tipo de pedido
          </p>
          <p className="text-xs text-[#C45C26]/70 mb-4">
            Puedes combinar cajas e individuales
          </p>

          <div className="space-y-3">
            {OPTIONS.map(({ type, emoji, desc, badge }) => {
              const selected = isSelected(type)
              const qty = getQuantity(type)
              const capacity = CONTAINER_CAPACITY[type]

              return (
                <div
                  key={type}
                  className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden
                    ${selected
                      ? 'border-[#C45C26] bg-white shadow-md'
                      : 'border-[#C45C26]/20 bg-white hover:border-[#C45C26]/50'
                    }`}
                >
                  <button
                    onClick={() => toggleType(type)}
                    className="w-full flex items-center gap-4 px-4 py-4 text-left active:scale-95 transition-transform"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                      ${selected ? 'bg-[#C45C26]/10' : 'bg-[#F5ECD7]'}`}>
                      {emoji}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#6B2D0E] text-sm">
                          {CONTAINER_LABELS[type]}
                        </span>
                        {badge && (
                          <span className="text-xs bg-[#C45C26] text-white px-2 py-0.5 rounded-full font-semibold">
                            {badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#C45C26]/70 mt-0.5">{desc}</p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-[#C45C26]/60 font-medium">
                        desde ${ROLL_PRICES.clasico.toFixed(2)}/rol
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${selected ? 'border-[#C45C26] bg-[#C45C26]' : 'border-[#C45C26]/30'}`}>
                        {selected && <span className="text-white text-xs font-bold">✓</span>}
                      </div>
                    </div>
                  </button>

                  {selected && (
                    <div className="flex items-center justify-between px-4 py-3 bg-[#F5ECD7]/60 border-t border-[#C45C26]/10">
                      <div>
                        <span className="text-xs font-semibold text-[#8B4513]">
                          ¿Cuántas {type === 'individual' ? 'unidades' : 'cajas'}?
                        </span>
                        {type !== 'individual' && (
                          <p className="text-xs text-[#C45C26]/60 mt-0.5">
                            = {qty * capacity} roles a llenar
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(type, -1)}
                          className="w-8 h-8 rounded-full bg-white border-2 border-[#C45C26]/30 flex items-center justify-center font-bold text-[#C45C26] active:scale-90 transition-transform"
                        >
                          −
                        </button>
                        <span className="font-black text-[#6B2D0E] text-lg w-6 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(type, 1)}
                          className="w-8 h-8 rounded-full bg-[#C45C26] flex items-center justify-center font-bold text-white active:scale-90 transition-transform"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Resumen */}
        {selections.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#C45C26]/60 font-semibold">Tu pedido hasta ahora</p>
              <p className="text-sm font-bold text-[#6B2D0E] mt-0.5">
                {getTotalRolls()} roles para llenar
              </p>
            </div>
            <span className="text-xs text-[#C45C26]/60 font-medium text-right">
              El precio se calcula{'\n'}según los sabores
            </span>
          </div>
        )}

        <button
          disabled={selections.length === 0}
          onClick={handleContinue}
          className="w-full bg-[#C45C26] hover:bg-[#A34820] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md disabled:shadow-none"
        >
          Elegir sabores →
        </button>

      </div>
    </WizardLayout>
  )
}