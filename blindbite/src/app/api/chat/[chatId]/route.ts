import { NextRequest, NextResponse } from 'next/server';
import { supabase, safeSingle } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;

  const { data: chat, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Enrich with display fields
  const cr = await safeSingle<{ requester_id: string; recommender_id: string; craving_id: string; recommendation_id: string }>(
    supabase.from('chat_requests').select('requester_id, recommender_id, craving_id, recommendation_id').eq('id', chat.chat_request_id).single()
  );

  let otherUserName = 'someone';
  let restaurantName: string | null = null;

  if (cr) {
    const craving = await safeSingle<{ user_name: string }>(
      supabase.from('cravings').select('user_name').eq('id', cr.craving_id).single()
    );
    otherUserName = craving?.user_name ?? 'someone';

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
