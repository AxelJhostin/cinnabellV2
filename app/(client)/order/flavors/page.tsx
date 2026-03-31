'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { useOrderStore } from '@/stores/orderStore'
import {
  FLAVORS,
  getRollPrice,
  ROLL_PRICES,
  FLAVOR_IMAGES,
  CONTAINER_LABELS,
  CONTAINER_CAPACITY,
} from '@/constants/products'
import { OrderItem } from '@/types'

export default function FlavorsPage() {
  const router = useRouter()
  const { order, setItems, setTotal, setStep } = useOrderStore()
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [flavorCounts, setFlavorCounts] = useState<Record<string, Record<string, number>>>({})

  const items = order.items ?? []
  const currentItem = items[currentItemIndex]

  useEffect(() => {
    if (items.length === 0) router.replace('/order/type')
  }, [items])

  if (!currentItem) return null

  const capacity = CONTAINER_CAPACITY[currentItem.containerType] * currentItem.quantity
  const itemFlavors = flavorCounts[currentItem.id] ?? {}
  const filledSlots = Object.values(itemFlavors).reduce((a, b) => a + b, 0)
  const remaining = capacity - filledSlots
  const isFull = remaining === 0

  function updateFlavor(flavorId: string, delta: number) {
    const current = itemFlavors[flavorId] ?? 0
    const next = Math.max(0, current + delta)
    if (delta > 0 && remaining <= 0) return
    setFlavorCounts((prev) => ({
      ...prev,
      [currentItem.id]: { ...itemFlavors, [flavorId]: next },
    }))
  }

  function calcItemSubtotal(itemId: string) {
    const counts = flavorCounts[itemId] ?? {}
    return Object.entries(counts).reduce((acc, [flavorId, count]) => {
      return acc + getRollPrice(flavorId) * count
    }, 0)
  }

  function handleNext() {
    if (!isFull) return

    const updatedItems: OrderItem[] = items.map((item) => {
      const counts = flavorCounts[item.id] ?? {}
      const flavors = Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([flavorId, count]) => ({
          flavorId,
          flavorName: FLAVORS.find((f) => f.id === flavorId)?.name ?? flavorId,
          count,
        }))

      const subtotal = Object.entries(counts).reduce((acc, [flavorId, count]) => {
        return acc + getRollPrice(flavorId) * count
      }, 0)

      return {
        ...item,
        flavors,
        unitPrice: subtotal / item.quantity,
        subtotal,
      }
    })

    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex((i) => i + 1)
      return
    }

    const total = updatedItems.reduce((acc, item) => acc + item.subtotal, 0)
    setItems(updatedItems)
    setTotal(total)
    setStep(4)
    router.push('/order/summary')
  }

  const totalSoFar = items
    .slice(0, currentItemIndex)
    .reduce((acc, item) => acc + calcItemSubtotal(item.id), 0) +
    calcItemSubtotal(currentItem.id)

  return (
    <WizardLayout
      step={3}
      totalSteps={7}
      title="Elige los sabores"
      onBack={() => {
        if (currentItemIndex > 0) setCurrentItemIndex((i) => i - 1)
        else router.back()
      }}
    >
      <div className="space-y-5">

        {/* Indicador de ítems */}
        {items.length > 1 && (
          <div className="flex gap-2">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300
                  ${i < currentItemIndex ? 'bg-[#C45C26]'
                    : i === currentItemIndex ? 'bg-[#C45C26]/60'
                    : 'bg-[#C45C26]/15'}`}
              />
            ))}
          </div>
        )}

        {/* Header del ítem */}
        <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#C45C26]/60 font-semibold uppercase tracking-wide">
                {items.length > 1
                  ? `Ítem ${currentItemIndex + 1} de ${items.length}`
                  : 'Tu pedido'}
              </p>
              <p className="font-black text-[#6B2D0E] text-base">
                {currentItem.quantity}x {CONTAINER_LABELS[currentItem.containerType]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#C45C26]/60">Espacios</p>
              <p className={`font-black text-xl ${isFull ? 'text-green-600' : 'text-[#C45C26]'}`}>
                {filledSlots}/{capacity}
              </p>
            </div>
          </div>

          {/* Barra de llenado */}
          <div className="mt-3 h-2 bg-[#C45C26]/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300
                ${isFull ? 'bg-green-500' : 'bg-[#C45C26]'}`}
              style={{ width: `${(filledSlots / capacity) * 100}%` }}
            />
          </div>

          {!isFull ? (
            <p className="text-xs text-[#C45C26]/60 mt-2 text-center">
              {remaining} {remaining === 1 ? 'espacio' : 'espacios'} por llenar
            </p>
          ) : (
            <p className="text-xs text-green-600 font-semibold mt-2 text-center">
              ✓ ¡Caja completa!
            </p>
          )}
        </div>

        {/* Referencia de precios */}
        <div className="flex gap-2">
          {[
            { label: 'Clásico', price: ROLL_PRICES.clasico, color: 'bg-amber-100 text-amber-800' },
            { label: 'Premium', price: ROLL_PRICES.premium, color: 'bg-orange-100 text-orange-800' },
            { label: 'Especial', price: ROLL_PRICES.especial, color: 'bg-red-100 text-red-800' },
          ].map(({ label, price, color }) => (
            <div key={label} className={`flex-1 text-center py-1.5 rounded-xl text-xs font-bold ${color}`}>
              {label}<br />${price.toFixed(2)}
            </div>
          ))}
        </div>

        {/* Lista de sabores con imagen */}
        <div className="space-y-3">
          {FLAVORS.map((flavor) => {
            const count = itemFlavors[flavor.id] ?? 0
            const price = getRollPrice(flavor.id)
            const isEspecial = flavor.isSpecial
            const isPremium = !isEspecial && flavor.id !== 'clasico'
            const imgSrc = FLAVOR_IMAGES[flavor.id]

            return (
              <div
                key={flavor.id}
                className={`flex items-center rounded-2xl border transition-all duration-150 overflow-hidden
                  ${count > 0
                    ? 'border-[#C45C26] bg-white shadow-sm'
                    : 'border-[#C45C26]/15 bg-white'
                  }`}
              >
                {/* Imagen cuadrada fija */}
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={imgSrc}
                    alt={flavor.name}
                    className="w-24 h-24 object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 px-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0
                      ${isEspecial ? 'bg-red-400' : isPremium ? 'bg-orange-400' : 'bg-amber-400'}`}
                    />
                    <span className="font-bold text-[#6B2D0E] text-sm">{flavor.name}</span>
                  </div>
                  <span className={`text-xs font-bold
                    ${isEspecial ? 'text-red-500' : isPremium ? 'text-orange-500' : 'text-amber-600'}`}>
                    ${price.toFixed(2)} por rol
                  </span>
                  <p className="text-xs text-[#C45C26]/50 mt-0.5">
                    {isEspecial ? 'Especial' : isPremium ? 'Premium' : 'Clásico'}
                  </p>
                </div>

                {/* Contador — horizontal */}
                <div className="flex items-center gap-2 px-4">
                  <button
                    onClick={() => updateFlavor(flavor.id, -1)}
                    disabled={count === 0}
                    className="w-8 h-8 rounded-full border-2 border-[#C45C26]/30 flex items-center justify-center font-bold text-[#C45C26] text-lg disabled:opacity-30 active:scale-90 transition-all leading-none"
                  >
                    −
                  </button>
                  <span className={`font-black text-lg w-6 text-center leading-none
                    ${count > 0 ? 'text-[#C45C26]' : 'text-[#C45C26]/25'}`}>
                    {count}
                  </span>
                  <button
                    onClick={() => updateFlavor(flavor.id, 1)}
                    disabled={isFull}
                    className="w-8 h-8 rounded-full bg-[#C45C26] flex items-center justify-center font-bold text-white text-lg disabled:opacity-30 active:scale-90 transition-all leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Subtotal */}
        {filledSlots > 0 && (
          <div className="bg-white rounded-2xl border border-[#C45C26]/20 px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-[#C45C26]/60 font-semibold">Subtotal este ítem</p>
              <p className="text-xs text-[#8B4513] mt-0.5">
                Acumulado total: ${totalSoFar.toFixed(2)}
              </p>
            </div>
            <span className="font-black text-[#C45C26] text-xl">
              ${calcItemSubtotal(currentItem.id).toFixed(2)}
            </span>
          </div>
        )}

        {/* Botón */}
        <button
          disabled={!isFull}
          onClick={handleNext}
          className="w-full bg-[#C45C26] hover:bg-[#A34820] disabled:bg-[#C45C26]/20 disabled:text-[#C45C26]/40 text-white font-bold py-4 rounded-full text-base transition-all duration-200 active:scale-95 shadow-md disabled:shadow-none"
        >
          {currentItemIndex < items.length - 1 ? 'Siguiente ítem →' : 'Ver resumen →'}
        </button>

      </div>
    </WizardLayout>
  )
}