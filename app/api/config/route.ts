import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_config')
      .select('*')
      .gte('date', today)
      .eq('is_open', true)
      .order('date', { ascending: true })

    if (error) throw error

    // Mapear a camelCase para el frontend
    const mapped = data.map((d) => ({
      id: d.id,
      date: d.date,
      dayOfWeek: d.day_of_week,
      morningAvailable: d.morning_available,
      afternoonAvailable: d.afternoon_available,
      maxRolls: d.max_rolls,
      currentRolls: d.current_rolls,
      isOpen: d.is_open,
    }))

    return NextResponse.json(mapped)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}