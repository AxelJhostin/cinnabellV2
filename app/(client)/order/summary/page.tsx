'use client'

import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { useOrderStore } from '@/stores/orderStore'
import { CONTAINER_LABELS, FLAVOR_IMAGES } from '@/constants/products'
import { SHIFTS } from '@/constants/delivery'

export default function SummaryPage() {
  const router = useRouter()
  const { order, setStep } = useOrderStore()

  if (!order.items || order.items.length === 0) {
    router.replace('/')
    return null
  }

  const shift = order.deliveryShift ? SHIFTS[order.deliveryShift] : ''

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-EC', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }

  function handleContinue() {
    setStep(5)
    router.push('/order/payment')
  }

  return (
    <WizardLayout
      step={4}
      totalSteps={7}
      title="Resumen de tu pedido"
      onBack={() => router.back()}
    >
      <div className="space-y-4">

        {/* Fecha y turno */}
        <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <p className="text-xs text-[#C45C26]/60 font-semibold uppercase tracking-wide">Entrega</p>
            <p className="font-bold text-[#6B2D0E] text-sm capitalize">
              {order.deliveryDate ? formatDate(order.deliveryDate) : '—'}
            </p>
            <p className="text-xs text-[#C45C26]/70">{shift}</p>
          </div>
        </div>

        {/* Ítems del pedido */}
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#C45C26]/20 overflow-hidden">

              {/* Header del ítem */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#C45C26]/10">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {item.containerType === 'caja_4' ? '📦'
                      : item.containerType === 'caja_6' ? '🎁' : '🥐'}
                  </span>
                  <span className="font-bold text-[#6B2D0E] text-sm">
                    {item.quantity}x {CONTAINER_LABELS[item.containerType]}
                  </span>
                </div>
                <span className="font-black text-[#C45C26]">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>

              {/* Sabores */}
              <div className="px-4 py-3 space-y-2">
                {item.flavors.map((f) => (
                  <div key={f.flavorId} className="flex items-center gap-3">
                    <img
                      src={FLAVOR_IMAGES[f.flavorId]}
                      alt={f.flavorName}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <span className="flex-1 text-sm text-[#6B2D0E] font-medium">
                      {f.flavorName}
                    </span>
                    <span className="text-xs font-bold text-[#C45C26]/70 bg-[#C45C26]/10 px-2 py-0.5 rounded-full">
                      x{f.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-[#C45C26] rounded-2xl px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">Total estimado</p>
            <p className="text-white/80 text-xs mt-0.5">Puede variar si hay costo de envío</p>
          </div>
          <span className="font-black text-white text-3xl">
            ${(order.totalPrice ?? 0).toFixed(2)}
          </span>
        </div>

        {/* Nota */}
        <p className="text-center text-xs text-[#C45C26]/50">
          ¿Algo está mal?{' '}
          <button
            onClick={() => router.push('/order/type')}
            className="text-[#C45C26] font-bold underline"
          >
            Editar pedido
          </button>
        </p>

        {/* Botón */}
        <button
          onClick={handleContinue}
          className="w-full bg-[#C45C26] hover:bg-[#A34820] text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md"
        >
          Continuar →
        </button>

      </div>
    </WizardLayout>
  )
}