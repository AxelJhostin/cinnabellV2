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

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 })
  }
}