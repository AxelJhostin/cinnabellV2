import { Order } from '@/types'
import { CONTAINER_LABELS } from '@/constants/products'
import { SHIFTS } from '@/constants/delivery'

export function generateWhatsAppMessage(order: Order, orderNumber: number): string {
  const items = order.items.map((item) => {
    const label = CONTAINER_LABELS[item.containerType]
    const flavors = item.flavors
      .map((f) => `${f.flavorName} x${f.count}`)
      .join(', ')
    return `* ${item.quantity}x ${label} -> ${flavors}`
  }).join('\n')

  const shift = SHIFTS[order.deliveryShift]

  const delivery = order.deliveryType === 'envio'
    ? `Envio - ${order.deliveryAddress}`
    : 'Retiro en local'

  const payment = order.paymentMethod === 'transferencia'
    ? 'Transferencia'
    : 'Efectivo'

  const notes = order.notes ? `\nNota: ${order.notes}` : ''

  const transferenciaAviso = order.paymentMethod === 'transferencia'
    ? `\n\n------------------------------\nPAGO POR TRANSFERENCIA\nPor favor adjunta el comprobante de pago en este mismo chat antes de confirmar el pedido.\n------------------------------`
    : ''

  const envioAviso = order.deliveryType === 'envio'
    ? `\n\n------------------------------\nPEDIDO CON ENVIO\nPor favor comparte tu ubicacion actual por WhatsApp para coordinar la entrega.\n------------------------------`
    : ''

  const text =
    `NUEVO PEDIDO - CINNABELL\n` +
    `Pedido #${String(orderNumber).padStart(4, '0')}\n\n` +
    `Cliente: ${order.customerName}\n` +
    `Celular: ${order.phone}\n` +
    `Contacto: ${order.contactInfo}\n\n` +
    `PEDIDO:\n${items}\n\n` +
    `Entrega: ${order.deliveryDate} - ${shift}\n` +
    `Tipo: ${delivery}\n` +
    `Pago: ${payment}\n\n` +
    `TOTAL: $${order.totalPrice.toFixed(2)}` +
    notes +
    transferenciaAviso +
    envioAviso

  return encodeURIComponent(text)
}

export function getWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  return `https://wa.me/${number}?text=${message}`
}