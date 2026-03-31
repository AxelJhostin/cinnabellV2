'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-xs">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#C45C26] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-4xl">🥐</span>
          </div>
          <h1 className="text-2xl font-black text-[#6B2D0E]">Cinnabell Admin</h1>
          <p className="text-xs text-[#C45C26]/60 mt-1">Panel de administración</p>
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#8B4513] uppercase tracking-wide mb-1.5 block">
              Correo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cinnabell.com"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium placeholder:text-[#C45C26]/30 focus:outline-none focus:border-[#C45C26] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#8B4513] uppercase tracking-wide mb-1.5 block">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#C45C26]/20 bg-white text-[#6B2D0E] text-sm font-medium placeholder:text-[#C45C26]/30 focus:outline-none focus:border-[#C45C26] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full bg-[#C45C26] hover:bg-[#A34820] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md disabled:shadow-none"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

      </div>
    </div>
  )
}