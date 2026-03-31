'use client'

import { useRouter } from 'next/navigation'

export default function DonePage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#F5ECD7]">
      <div className="mb-6">
        <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-6xl">🎉</span>
        </div>
        <h1 className="text-3xl font-black text-[#6B2D0E] mb-2">
          ¡Pedido enviado!
        </h1>
        <p className="text-[#8B4513] text-base leading-relaxed max-w-xs">
          Tu pedido fue enviado por WhatsApp. Las vendedoras lo confirmarán pronto. 🥐
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-6 py-4 mb-8 max-w-xs w-full">
        <p className="text-sm text-[#8B4513] leading-relaxed">
          Si elegiste <strong>transferencia</strong>, recuerda adjuntar el comprobante en el chat de WhatsApp.
        </p>
      </div>

      <button
        onClick={() => router.push('/')}
        className="w-full max-w-xs bg-[#C45C26] hover:bg-[#A34820] text-white font-bold py-4 rounded-full text-base transition-all active:scale-95 shadow-md"
      >
        Hacer otro pedido
      </button>
    </div>
  )
}