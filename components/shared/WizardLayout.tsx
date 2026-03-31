'use client'

import { Progress } from '@/components/ui/progress'
import { ChevronLeft } from 'lucide-react'

interface WizardLayoutProps {
  children: React.ReactNode
  step: number
  totalSteps: number
  title: string
  onBack?: () => void
  showBack?: boolean
}

export function WizardLayout({
  children,
  step,
  totalSteps,
  title,
  onBack,
  showBack = true,
}: WizardLayoutProps) {
  const progress = (step / totalSteps) * 100

  return (
    <div className="flex flex-col min-h-screen bg-[#F5ECD7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#F5ECD7]/95 backdrop-blur-sm border-b border-[#C45C26]/15 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-white border border-[#C45C26]/20 flex items-center justify-center hover:bg-[#C45C26]/5 transition-colors active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 text-[#C45C26]" />
            </button>
          )}
          <div className="flex-1">
            <p className="text-xs text-[#C45C26]/60 font-semibold uppercase tracking-wider">
              Paso {step} de {totalSteps}
            </p>
            <h1 className="text-xl font-black text-[#6B2D0E]">{title}</h1>
          </div>
          <span className="text-2xl">🥐</span>
        </div>
        <Progress
          value={progress}
          className="h-2 bg-[#C45C26]/15 rounded-full"
        />
      </div>

      {/* Contenido */}
      <div className="flex-1 px-4 py-6">
        {children}
      </div>
    </div>
  )
}