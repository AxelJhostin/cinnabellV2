'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { useOrderStore } from '@/stores/orderStore'

export default function CustomerPage() {
  const router = useRouter()
  const { setCustomer, setStep } = useOrderStore()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')

  const canContinue =
    name.trim().length > 0 &&
    phone.length === 10

  function handleContinue() {
    if (!canContinue) return
    setCustomer(name.trim(), phone.trim(), contact.trim(), notes.trim())
    setStep(7)
    router.push('/order/confirm')
  }

  return (
    <WizardLayout
      step={6}
      totalSteps={7}
      title="Tus datos"
      onBack={() => router.back()}
    >
      <div className="space-y-6">

        <div>
          <p className="text-base font-bold text-[#6B2D0E] mb-1">
            ¿Quién hace el pedido?
          </p>
          <p className="text-xs text-[#C45C26]/70 mb-5">
            Para poder contactarte y entregarte tu pedido
          </p>

          <div className="space-y-4">

            {/* Nombre */}
            <div>
              <label className="text-xs font-bold text-[#8B4513] uppercase tracking-wide mb-1.5 block">
                Nombre completo *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium placeholder:text-[#C45C26]/30 focus:outline-none focus:border-[#C45C26] transition-colors"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-xs font-bold text-[#8B4513] uppercase tracking-wide mb-1.5 block">
                Número de celular *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📱</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setPhone(val)
                  }}
                  placeholder="0991234567"
                  maxLength={10}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium placeholder:text-[#C45C26]/30 focus:outline-none focus:border-[#C45C26] transition-colors"
                />
              </div>
              {phone.length > 0 && phone.length < 10 && (
                <p className="text-xs text-red-400 font-medium mt-1.5 ml-2">
                  El número debe tener 10 dígitos
                </p>
              )}
            </div>

            {/* Instagram o correo */}
            <div>
              <label className="text-xs font-bold text-[#8B4513] uppercase tracking-wide mb-1.5 block">
                Instagram o correo
                <span className="text-[#C45C26]/40 font-normal ml-1">(opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📸</span>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="@tuusuario o tucorreo@gmail.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium placeholder:text-[#C45C26]/30 focus:outline-none focus:border-[#C45C26] transition-colors"
                />
              </div>
            </div>

            {/* Notas opcionales */}
            <div>
              <label className="text-xs font-bold text-[#8B4513] uppercase tracking-wide mb-1.5 block">
                Notas adicionales
                <span className="text-[#C45C26]/40 font-normal ml-1">(opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-lg">📝</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Alergias, preferencias, dedicatoria..."
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium placeholder:text-[#C45C26]/30 focus:outline-none focus:border-[#C45C26] transition-colors resize-none"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Info de privacidad */}
        <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <span className="text-lg flex-shrink-0">🔒</span>
          <p className="text-xs text-amber-800 leading-relaxed">
            Tus datos solo se usan para coordinar la entrega de tu pedido. No los compartimos con nadie.
          </p>
        </div>

        {/* Botón */}
        <button
          disabled={!canContinue}
          onClick={handleContinue}
          className="w-full bg-[#C45C26] hover:bg-[#A34820] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md disabled:shadow-none"
        >
          Revisar pedido →
        </button>

      </div>
    </WizardLayout>
  )
}