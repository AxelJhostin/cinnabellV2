import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_config')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })

    if (error) throw error

    const mapped = data.map((d) => ({
      id: d.id,
      date: d.date,
      dayOfWeek: d.day_of_week,
      morningAvailable: d.morning_available,
      afternoonAvailable: d.afternoon_available,
      maxRolls: d.max_rolls,
      currentRolls: d.current_rolls,
      isOpen: d.is_open,
      slots: d.slots ?? {},
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = await createServerSupabaseClient()

    const perSlot = Math.max(1, Math.floor((body.maxRolls ?? 50) / 10))
    const slots = {
      '12:00': { max: perSlot, current: 0 },
      '12:30': { max: perSlot, current: 0 },
      '13:00': { max: perSlot, current: 0 },
      '13:30': { max: perSlot, current: 0 },
      '15:00': { max: perSlot, current: 0 },
      '15:30': { max: perSlot, current: 0 },
      '16:00': { max: perSlot, current: 0 },
      '16:30': { max: perSlot, current: 0 },
      '17:00': { max: perSlot, current: 0 },
      '17:30': { max: perSlot, current: 0 },
    }

    const { error } = await supabase
      .from('daily_config')
      .insert({
        date: body.date,
        day_of_week: body.dayOfWeek,
        morning_available: body.morningAvailable ?? true,
        afternoon_available: body.afternoonAvailable ?? true,
        max_rolls: body.maxRolls ?? 50,
        current_rolls: 0,
        is_open: true,
        slots,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear día' }, { status: 500 })
  }
}