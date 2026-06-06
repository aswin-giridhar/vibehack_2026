import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const userId = new URL(request.url).searchParams.get('userId');
  const { data, error } = await supabase
    .from('chat_requests')
    .select('*')
    .eq('recommender_id', userId)
    .eq('status', 'pending');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ requests: data });
}
