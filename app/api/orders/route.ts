import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface OrderItemInput {
  containerType: 'caja_4' | 'caja_6' | 'individual'
  quantity: number
  flavors: { flavorId: string; flavorName: string; count: number }[]
  unitPrice: number
  subtotal: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createServerSupabaseClient()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: body.customerName,
        phone: body.phone,
        contact_info: body.contactInfo,
        delivery_date: body.deliveryDate,
        delivery_shift: body.deliveryShift,
        delivery_type: body.deliveryType,
        delivery_address: body.deliveryAddress || null,
        payment_method: body.paymentMethod,
        total_price: body.totalPrice,
        notes: body.notes || null,
        whatsapp_sent: true,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const items = body.items.map((item: OrderItemInput) => ({
      order_id: order.id,
      container_type: item.containerType,
      quantity: item.quantity,
      flavors: item.flavors,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items)

    if (itemsError) throw itemsError

    const totalRolls = body.items.reduce((acc: number, item: OrderItemInput) => {
      const capacity = item.containerType === 'caja_4' ? 4
        : item.containerType === 'caja_6' ? 6 : 1
      return acc + (item.quantity * capacity)
    }, 0)

    await supabase.rpc('increment_rolls', {
      p_date: body.deliveryDate,
      p_amount: totalRolls,
    })

    return NextResponse.json({ success: true, orderNumber: order.order_number })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al guardar el pedido' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
  }
}