'use client'

import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { useOrderStore } from '@/stores/orderStore'
import { CONTAINER_LABELS, FLAVOR_IMAGES } from '@/constants/products'
import { SHIFTS } from '@/constants/delivery'
import { generateWhatsAppMessage, getWhatsAppUrl } from '@/lib/whatsapp/generator'
import { Order } from '@/types'
import { useState, useEffect } from 'react'

export default function ConfirmPage() {
  const router = useRouter()
  const { order, resetOrder } = useOrderStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hasItems = order.items && order.items.length > 0

  useEffect(() => {
    if (!hasItems) router.replace('/')
  }, [hasItems])

if (!hasItems) return null

  const shift = order.deliveryShift ? SHIFTS[order.deliveryShift] : ''

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-EC', {
      weekday: 'long', day: 'numeric', month: 'long'
    })
  }

  async function handleConfirm() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      const message = generateWhatsAppMessage(order as Order, data.orderNumber)
      const url = getWhatsAppUrl(message)

      resetOrder()
      window.open(url, '_blank')
      router.push('/order/done')
    } catch {
      setError('Hubo un problema al guardar tu pedido. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <WizardLayout
      step={7}
      totalSteps={7}
      title="Confirma tu pedido"
      onBack={() => router.back()}
    >
      <div className="space-y-4">

        {/* Datos del cliente */}
        <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-4 space-y-2">
          <p className="text-xs font-bold text-[#C45C26]/60 uppercase tracking-wide mb-3">
            Tus datos
          </p>
          {[
            { emoji: '👤', label: order.customerName },
            { emoji: '📱', label: order.phone },
            { emoji: '📸', label: order.contactInfo },
          ].map(({ emoji, label }) => (
            <div key={emoji} className="flex items-center gap-3">
              <span className="text-base">{emoji}</span>
              <span className="text-sm font-medium text-[#6B2D0E]">{label}</span>
            </div>
          ))}
          {order.notes && (
            <div className="flex items-start gap-3 pt-1">
              <span className="text-base">📝</span>
              <span className="text-sm font-medium text-[#6B2D0E]">{order.notes}</span>
            </div>
          )}
        </div>

        {/* Entrega */}
        <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-4 space-y-2">
          <p className="text-xs font-bold text-[#C45C26]/60 uppercase tracking-wide mb-3">
            Entrega
          </p>
          <div className="flex items-center gap-3">
            <span className="text-base">📅</span>
            <span className="text-sm font-medium text-[#6B2D0E] capitalize">
              {order.deliveryDate ? formatDate(order.deliveryDate) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">🕐</span>
            <span className="text-sm font-medium text-[#6B2D0E]">{shift}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">
              {order.deliveryType === 'envio' ? '🛵' : '🏪'}
            </span>
            <span className="text-sm font-medium text-[#6B2D0E]">
              {order.deliveryType === 'envio'
                ? `Envío — ${order.deliveryAddress}`
                : 'Retiro en local'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base">
              {order.paymentMethod === 'transferencia' ? '📲' : '💵'}
            </span>
            <span className="text-sm font-medium text-[#6B2D0E] capitalize">
              {order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Ítems */}
        <div className="space-y-3">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-[#C45C26]/20 overflow-hidden">
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
              <div className="px-4 py-3 space-y-2">
                {item.flavors.map((f) => (
                  <div key={f.flavorId} className="flex items-center gap-3">
                    <img
                      src={FLAVOR_IMAGES[f.flavorId]}
                      alt={f.flavorName}
                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
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
          <span className="font-bold text-white text-base">Total a pagar</span>
          <span className="font-black text-white text-3xl">
            ${(order.totalPrice ?? 0).toFixed(2)}
          </span>
        </div>

        {/* Aviso transferencia */}
        {order.paymentMethod === 'transferencia' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              Recuerda adjuntar el comprobante de transferencia en el mensaje de WhatsApp.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Botón confirmar */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-[#25D366] hover:bg-[#1da851] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Guardando pedido...</span>
          ) : (
            <>
              <span>Confirmar y enviar por WhatsApp</span>
              <span className="text-xl">💬</span>
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#C45C26]/50">
          Al confirmar se abrirá WhatsApp con tu pedido listo para enviar
        </p>

      </div>
    </WizardLayout>
  )
}