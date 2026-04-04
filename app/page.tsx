'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SplashPage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-12 bg-[#F5ECD7]">

      {/* Top decorativo */}
      <div className="w-full flex justify-between text-2xl opacity-30 select-none">
        <span>✦</span><span>✦</span>
      </div>

      {/* Centro */}
      <div
        className={`flex flex-col items-center text-center transition-all duration-700 ease-out
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full bg-[#C45C26] flex items-center justify-center shadow-xl">
            <span className="text-6xl">🥐</span>
          </div>
          <span className="absolute -top-1 -right-1 text-xl animate-bounce">✨</span>
          <span className="absolute -bottom-1 -left-2 text-lg animate-pulse">⭐</span>
        </div>

        <h1 className="text-5xl font-black text-[#6B2D0E] tracking-tight leading-none mb-1">
          Cinnabell
        </h1>
        <p className="text-[#C45C26] font-semibold text-sm uppercase tracking-widest mb-6">
          Roles de canela & más
        </p>

        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {['🍂 Artesanales', '❤️ Con amor', '🎁 Para ti'].map((tag) => (
            <span
              key={tag}
              className="bg-[#C45C26]/10 text-[#6B2D0E] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#C45C26]/20"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="text-[#8B4513] text-lg font-medium leading-snug max-w-xs">
          Haz tu pedido en minutos y recíbelos fresquitos el día que elijas 🤍
        </p>
      </div>

      {/* Botones */}
      <div
        className={`w-full flex flex-col items-center gap-3 transition-all duration-700 delay-300 ease-out
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <button
          onClick={() => router.push('/order/schedule')}
          className="w-full max-w-xs bg-[#C45C26] hover:bg-[#A34820] active:scale-95 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transition-all duration-200"
        >
          Hacer mi pedido 🥐
        </button>

          <a
          href="https://www.instagram.com/cinnabell_ec/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs bg-white border-2 border-[#C45C26]/30 hover:border-[#C45C26] active:scale-95 text-[#6B2D0E] font-bold py-3.5 px-8 rounded-full text-base shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>📸</span>
          <span>Instagram</span>
        </a>

          <a
          href="https://www.tiktok.com/@cinnabell_ec"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs bg-white border-2 border-[#C45C26]/30 hover:border-[#C45C26] active:scale-95 text-[#6B2D0E] font-bold py-3.5 px-8 rounded-full text-base shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>🎵</span>
          <span>TikTok</span>
        </a>

        <p className="text-[#C45C26]/60 text-xs font-medium mt-1">
          Sin cuenta · Sin complicaciones
        </p>
      </div>

    </div>
  )
}