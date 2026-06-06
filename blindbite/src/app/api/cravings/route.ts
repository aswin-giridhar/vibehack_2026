import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabase
    .from('cravings')
    .insert({
      user_id: body.userId,
      user_name: body.userName,
      text: body.text,
      latitude: body.latitude,
      longitude: body.longitude,
      location: `SRID=4326;POINT(${body.longitude} ${body.latitude})`,
      status: 'active',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger AI co-recommender in background
  fetch(`${new URL(request.url).origin}/api/ai/co-recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cravingId: data.id, cravingText: body.text, latitude: body.latitude, longitude: body.longitude }),
  }).catch(console.error);

  return NextResponse.json({ craving: data });
}
