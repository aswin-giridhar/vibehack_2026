import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '51.5074');
  const lng = parseFloat(searchParams.get('lng') || '-0.1278');
  const radius = parseInt(searchParams.get('radius') || '2000');

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng must be valid numbers' }, { status: 400 });
  }
  if (isNaN(radius) || radius <= 0) {
    return NextResponse.json({ error: 'radius must be a positive number' }, { status: 400 });
  }

  // Try PostGIS RPC first, fallback to simple query
  const { data, error } = await supabase.rpc('nearby_cravings', { lat, lng, radius_meters: radius });
  if (error) {
    const { data: fallback, error: err2 } = await supabase
      .from('cravings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);
    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 });
    return NextResponse.json({ cravings: fallback ?? [] });
  }
  return NextResponse.json({ cravings: data ?? [] });
}
