import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ cravingId: string }> }) {
  const { cravingId } = await params;
  const { data, error } = await supabase
    .from('cravings')
    .select('*')
    .eq('id', cravingId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ craving: data });
}
