import { NextRequest, NextResponse } from 'next/server';
import { supabase, safeSingle } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;

  const { data: chat, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();

  if (error) {
    // PGRST116 = row not found → 404; anything else → 500
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  // Enrich with display fields
  const cr = await safeSingle<{ requester_id: string; recommender_id: string; craving_id: string; recommendation_id: string }>(
    supabase.from('chat_requests').select('requester_id, recommender_id, craving_id, recommendation_id').eq('id', chat.chat_request_id).single()
  );

  let otherUserName = 'someone';
  let restaurantName: string | null = null;

  if (cr) {
    // Try cravings first for user_name, then fall back to recommendations
    const craving = await safeSingle<{ user_name: string }>(
      supabase.from('cravings').select('user_name').eq('id', cr.craving_id).single()
    );
    if (craving?.user_name) {
      otherUserName = craving.user_name;
    } else {
      const recName = await safeSingle<{ recommender_name: string }>(
        supabase.from('recommendations').select('recommender_name').eq('id', cr.recommendation_id).single()
      );
      otherUserName = recName?.recommender_name ?? 'someone';
    }

    const rec = await safeSingle<{ restaurant_name: string | null }>(
      supabase.from('recommendations').select('restaurant_name').eq('id', cr.recommendation_id).single()
    );
    restaurantName = rec?.restaurant_name ?? null;
  }

  const enrichedChat = {
    ...chat,
    other_user_name: otherUserName,
    restaurant_name: restaurantName,
  };

  return NextResponse.json({ chat: enrichedChat });
}
