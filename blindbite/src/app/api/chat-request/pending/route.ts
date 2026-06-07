import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get('userId');
  const { data, error } = await supabase
    .from('chat_requests')
    .select('*')
    .or(`requester_id.eq.${userId},recommender_id.eq.${userId}`)
    .eq('status', 'pending');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with display fields from the linked recommendation
  const requests = await Promise.all((data ?? []).map(async (cr) => {
    const { data: rec } = await supabase
      .from('recommendations')
      .select('restaurant_name, recommender_name')
      .eq('id', cr.recommendation_id)
      .single();

    // Fetch requester name from cravings table (user_name is stored there)
    const { data: craving } = await supabase
      .from('cravings')
      .select('user_name')
      .eq('id', cr.craving_id)
      .single();

    return {
      ...cr,
      restaurant_name: rec?.restaurant_name ?? null,
      recommender_name: rec?.recommender_name ?? null,
      requester_name: craving?.user_name ?? null,
    };
  }));

  return NextResponse.json({ requests });
}
