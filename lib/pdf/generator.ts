import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface OrderItem {
  container_type: string
  quantity: number
  flavors: { flavorName: string; count: number }[]
}

interface Order {
  order_number: number
  customer_name: string
  phone: string
  delivery_shift: string
  delivery_type: string
  payment_method: string
  total_price: number
  notes?: string
  order_items: OrderItem[]
}

const SHIFTS: Record<string, string> = {
  manana: 'Mañana (10:00 – 12:00)',
  tarde: 'Tarde (15:00 – 18:00)',
  acordar: 'A coordinar',
}

const CONTAINER_LABELS: Record<string, string> = {
  caja_4: 'Caja x4',
  caja_6: 'Caja x6',
  individual: 'Individual',
}

export function generateDayPDF(orders: Order[], date: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()

  // Colores
  const CINNAMON = [196, 92, 38] as [number, number, number]
  const BROWN = [74, 37, 18] as [number, number, number]
  const LIGHT = [245, 236, 215] as [number, number, number]

  // Header
  doc.setFillColor(...CINNAMON)
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('CINNABELL', 14, 12)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Hoja de trabajo del dia', 14, 20)

  // Fecha
  const dateObj = new Date(date + 'T12:00:00')
  const dateStr = dateObj.toLocaleDateString('es-EC', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(dateStr.toUpperCase(), pageWidth - 14, 14, { align: 'right' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total pedidos: ${orders.length}`, pageWidth - 14, 22, { align: 'right' })

  let y = 35

  // Resumen de sabores por turno
  const shiftGroups: Record<string, Record<string, number>> = {
    manana: {}, tarde: {}, acordar: {}
  }
  orders.forEach((order) => {
    const shift = order.delivery_shift
    if (!shiftGroups[shift]) shiftGroups[shift] = {}
    order.order_items.forEach((item) => {
      item.flavors.forEach((f) => {
        shiftGroups[shift][f.flavorName] = (shiftGroups[shift][f.flavorName] ?? 0) + f.count
      })
    })
  })

  // Total general de sabores
  const totalFlavors: Record<string, number> = {}
  orders.forEach((order) => {
    order.order_items.forEach((item) => {
      item.flavors.forEach((f) => {
        totalFlavors[f.flavorName] = (totalFlavors[f.flavorName] ?? 0) + f.count
      })
    })
  })

  if (Object.keys(totalFlavors).length > 0) {
    doc.setFillColor(...LIGHT)
    doc.rect(14, y - 5, pageWidth - 28, 8, 'F')
    doc.setTextColor(...BROWN)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN DE SABORES A PREPARAR', 14, y)
    y += 6

    // Tabla de sabores por turno
    const turnoRows: string[][] = []
    ;(['manana', 'tarde', 'acordar'] as const).forEach((shift) => {
      const flavors = shiftGroups[shift]
      if (Object.keys(flavors).length === 0) return
      Object.entries(flavors)
        .sort((a, b) => b[1] - a[1])
        .forEach(([name, count]) => {
          turnoRows.push([SHIFTS[shift], name, String(count)])
        })
    })

    autoTable(doc, {
      startY: y,
      head: [['Turno', 'Sabor', 'Cantidad']],
      body: turnoRows,
      theme: 'grid',
      headStyles: { fillColor: CINNAMON, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: BROWN },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 90 }, 2: { cellWidth: 30, halign: 'center' } },
      margin: { left: 14, right: 14 },
    })

    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  }

  // Lista de pedidos
  doc.setFillColor(...LIGHT)
  doc.rect(14, y - 5, pageWidth - 28, 8, 'F')
  doc.setTextColor(...BROWN)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('LISTA DE PEDIDOS', 14, y)
  y += 6

  const orderRows = orders.map((order) => {
    const items = order.order_items.map((item) => {
      const label = CONTAINER_LABELS[item.container_type] ?? item.container_type
      const flavors = item.flavors.map((f) => `${f.flavorName} x${f.count}`).join(', ')
      return `${item.quantity}x ${label}: ${flavors}`
    }).join('\n')

    return [
      `#${String(order.order_number).padStart(4, '0')}`,
      order.customer_name,
      order.phone,
      SHIFTS[order.delivery_shift] ?? order.delivery_shift,
      items,
      order.delivery_type === 'envio' ? 'Envio' : 'Retiro',
      order.payment_method === 'transferencia' ? 'Transfer.' : 'Efectivo',
      `$${order.total_price.toFixed(2)}`,
      order.notes ?? '',
      '☐',
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['#', 'Cliente', 'Tel.', 'Turno', 'Pedido', 'Entrega', 'Pago', 'Total', 'Notas', 'Listo']],
    body: orderRows,
    theme: 'grid',
    headStyles: { fillColor: CINNAMON, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: BROWN, valign: 'top' },
    columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 35 },
        2: { cellWidth: 28 },
        3: { cellWidth: 28 },
        4: { cellWidth: 70 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 },
        7: { cellWidth: 18 },
        8: { cellWidth: 28 },
        9: { cellWidth: 12, halign: 'center', fontSize: 14 },
        },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.row.index % 2 === 0 && data.section === 'body') {
        data.cell.styles.fillColor = [253, 250, 246]
      }
    },
  })

  // Footer
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'italic')
  doc.text(
    `Generado el ${new Date().toLocaleString('es-EC')} — Cinnabell`,
    pageWidth / 2, finalY, { align: 'center' }
  )

  doc.save(`cinnabell-${date}.pdf`)
}