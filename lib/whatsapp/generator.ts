import { Order } from '@/types'
import { CONTAINER_LABELS, PRICES } from '@/constants/products'
import { SHIFTS } from '@/constants/delivery'

export function generateWhatsAppMessage(order: Order, orderNumber: number): string {
  const items = order.items.map((item) => {
    const label = CONTAINER_LABELS[item.containerType]
    const flavors = item.flavors
      .map((f) => `${f.flavorName} x${f.count}`)
      .join(', ')
    return `• ${item.quantity}x ${label} → ${flavors}`
  }).join('\n')

  const shift = SHIFTS[order.deliveryShift]
  const delivery = order.deliveryType === 'envio'
    ? `ENVÍO — ${order.deliveryAddress}`
    : 'RETIRO en local'
  const payment = order.paymentMethod === 'transferencia'
    ? 'Transferencia *(adjunto comprobante)*'
    : 'Efectivo'

  const notes = order.notes ? `\n📝 Nota: ${order.notes}` : ''

  return encodeURIComponent(
    `🥐 NUEVO PEDIDO — CINNABELL\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 Pedido #${String(orderNumber).padStart(4, '0')}\n\n` +
    `👤 Cliente: ${order.customerName}\n` +
    `📱 Celular: ${order.phone}\n` +
    `📸 Contacto: ${order.contactInfo}\n\n` +
    `🛒 PEDIDO:\n${items}\n\n` +
    `📅 Entrega: ${order.deliveryDate} — ${shift}\n` +
    `🚗 Tipo: ${delivery}\n` +
    `💳 Pago: ${payment}\n\n` +
    `💰 TOTAL: $${order.totalPrice.toFixed(2)}` +
    notes
  )
}

export function getWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  return `https://wa.me/${number}?text=${message}`
}