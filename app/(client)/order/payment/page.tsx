'use client'

import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { useOrderStore } from '@/stores/orderStore'
import { DeliveryType, PaymentMethod } from '@/types'
import { DELIVERY_COST } from '@/constants/delivery'
import { useState } from 'react'

export default function PaymentPage() {
  const router = useRouter()
  const { order, setPayment, setTotal, setStep } = useOrderStore()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [deliveryType, setDeliveryType] = useState<DeliveryType | ''>('')
  const [address, setAddress] = useState('')

  const subtotal = order.totalPrice ?? 0
  const deliveryCost = deliveryType === 'envio' ? DELIVERY_COST : 0
  const total = subtotal + deliveryCost

  function handleContinue() {
    if (!paymentMethod || !deliveryType) return
    if (deliveryType === 'envio' && !address.trim()) return

    setPayment(
      paymentMethod as PaymentMethod,
      deliveryType as DeliveryType,
      deliveryType === 'envio' ? address : undefined
    )
    setTotal(total)
    setStep(6)
    router.push('/order/customer')
  }

  const canContinue =
    !!paymentMethod &&
    !!deliveryType &&
    (deliveryType === 'retiro' || address.trim().length > 0)

  return (
    <WizardLayout
      step={5}
      totalSteps={7}
      title="Pago y entrega"
      onBack={() => router.back()}
    >
      <div className="space-y-6">

        {/* Método de pago */}
        <div>
          <p className="text-base font-bold text-[#6B2D0E] mb-1">
            ¿Cómo vas a pagar?
          </p>
          <p className="text-xs text-[#C45C26]/70 mb-4">
            Elige tu método de pago preferido
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'efectivo' as PaymentMethod, emoji: '💵', label: 'Efectivo', desc: 'Al momento de la entrega' },
              { value: 'transferencia' as PaymentMethod, emoji: '📲', label: 'Transferencia', desc: 'Adjuntas el comprobante' },
            ].map(({ value, emoji, label, desc }) => (
              <button
                key={value}
                onClick={() => setPaymentMethod(value)}
                className={`flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 transition-all duration-200 active:scale-95
                  ${paymentMethod === value
                    ? 'border-[#C45C26] bg-[#C45C26] text-white shadow-md'
                    : 'border-[#C45C26]/20 bg-white text-[#6B2D0E] hover:border-[#C45C26]/50'
                  }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="font-bold text-sm">{label}</span>
                <span className={`text-xs text-center leading-tight
                  ${paymentMethod === value ? 'text-white/80' : 'text-[#C45C26]/60'}`}>
                  {desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de entrega */}
        <div>
          <p className="text-base font-bold text-[#6B2D0E] mb-1">
            ¿Cómo lo recibes?
          </p>
          <p className="text-xs text-[#C45C26]/70 mb-4">
            El envío tiene un costo adicional de ${DELIVERY_COST.toFixed(2)}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'retiro' as DeliveryType, emoji: '🏪', label: 'Retiro', desc: 'Vienes a buscarlo' },
              { value: 'envio' as DeliveryType, emoji: '🛵', label: 'Envío', desc: `+$${DELIVERY_COST.toFixed(2)} a domicilio` },
            ].map(({ value, emoji, label, desc }) => (
              <button
                key={value}
                onClick={() => setDeliveryType(value)}
                className={`flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 transition-all duration-200 active:scale-95
                  ${deliveryType === value
                    ? 'border-[#C45C26] bg-[#C45C26] text-white shadow-md'
                    : 'border-[#C45C26]/20 bg-white text-[#6B2D0E] hover:border-[#C45C26]/50'
                  }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className="font-bold text-sm">{label}</span>
                <span className={`text-xs text-center leading-tight
                  ${deliveryType === value ? 'text-white/80' : 'text-[#C45C26]/60'}`}>
                  {desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dirección — solo si es envío */}
        {deliveryType === 'envio' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <p className="text-base font-bold text-[#6B2D0E] mb-1">
              ¿A dónde te lo enviamos?
            </p>
            <p className="text-xs text-[#C45C26]/70 mb-3">
              Incluye una referencia para encontrarte fácil
            </p>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Calle Principal y Av. Secundaria, casa azul con reja negra..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium placeholder:text-[#C45C26]/30 focus:outline-none focus:border-[#C45C26] transition-colors resize-none"
            />
          </div>
        )}

        {/* Transferencia — aviso */}
        {paymentMethod === 'transferencia' && (
          <div className="animate-in slide-in-from-bottom-4 duration-300 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
            <span className="text-xl flex-shrink-0">ℹ️</span>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Al confirmar el pedido se abrirá WhatsApp. Adjunta el comprobante de transferencia en ese mismo mensaje.
            </p>
          </div>
        )}

        {/* Resumen de total */}
        <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8B4513]">Subtotal roles</span>
            <span className="font-bold text-[#6B2D0E]">${subtotal.toFixed(2)}</span>
          </div>
          {deliveryType === 'envio' && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8B4513]">Costo de envío</span>
              <span className="font-bold text-[#6B2D0E]">${DELIVERY_COST.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-[#C45C26]/10 pt-2 flex justify-between">
            <span className="font-bold text-[#6B2D0E]">Total</span>
            <span className="font-black text-[#C45C26] text-lg">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón */}
        <button
          disabled={!canContinue}
          onClick={handleContinue}
          className="w-full bg-[#C45C26] hover:bg-[#A34820] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md disabled:shadow-none"
        >
          Continuar →
        </button>

      </div>
    </WizardLayout>
  )
}