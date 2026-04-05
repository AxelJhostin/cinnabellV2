import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('daily_config')
      .update({
        morning_available: body.morningAvailable,
        afternoon_available: body.afternoonAvailable,
        max_rolls: body.maxRolls,
        is_open: body.isOpen,
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.rpc('update_slot_max', {
      p_id: id,
      p_slot: body.slot,
      p_max: body.max,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar slot' }, { status: 500 })
  }
}