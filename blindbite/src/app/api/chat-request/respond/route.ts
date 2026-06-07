import { NextRequest, NextResponse } from 'next/server';
import { supabase, safeSingle } from '@/lib/supabase';
import type { RespondChatRequestRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  let body: RespondChatRequestRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.chatRequestId || !body.recommenderId || typeof body.accept !== 'boolean') {
    return NextResponse.json({ error: 'Missing required fields: chatRequestId, recommenderId, accept' }, { status: 400 });
  }

  if (body.accept) {
    const { data: chatRequest, error: updateErr } = await supabase
      .from('chat_requests')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', body.chatRequestId)
      .select()
      .single();

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    const cr = await safeSingle<{ icebreaker: string | null; requester_id: string; recommender_id: string; craving_id: string; recommendation_id: string }>(
      supabase.from('chat_requests').select('icebreaker, requester_id, recommender_id, craving_id, recommendation_id').eq('id', body.chatRequestId).single()
    );

    if (!cr) {
      return NextResponse.json({ error: 'Chat request not found after update' }, { status: 500 });
    }

    const { data: chat, error: chatErr } = await supabase
      .from('chats')
      .insert({ chat_request_id: body.chatRequestId, requester_id: cr?.requester_id, recommender_id: cr?.recommender_id })
      .select()
      .single();

    if (chatErr) return NextResponse.json({ error: chatErr.message }, { status: 500 });

    const { data: icebreaker } = await supabase
      .from('chat_messages')
      .insert({ chat_id: chat?.id, sender_id: 'system', content: cr?.icebreaker || 'You both love great food! 🍽️', is_icebreaker: true })
      .select()
      .single();

    // Enrich chat with display fields
    const otherUserId = body.recommenderId === cr?.requester_id ? cr?.recommender_id : cr?.requester_id;
    const otherCraving = await safeSingle<{ user_name: string }>(
      supabase.from('cravings').select('user_name').eq('user_id', otherUserId ?? '').limit(1).single()
    );
    const rec = await safeSingle<{ restaurant_name: string | null; recommender_name: string | null }>(
      supabase.from('recommendations').select('restaurant_name, recommender_name').eq('id', cr?.recommendation_id ?? '').single()
    );

    const enrichedChat = {
      ...chat,
      other_user_name: otherCraving?.user_name ?? 'someone',
      restaurant_name: rec?.restaurant_name ?? null,
    };

    // Enrich chatRequest with display fields
    const craving = await safeSingle<{ user_name: string }>(
      supabase.from('cravings').select('user_name').eq('id', cr?.craving_id ?? '').single()
    );
    const enrichedChatRequest = {
      ...chatRequest,
      requester_name: craving?.user_name ?? null,
      recommender_name: rec?.recommender_name ?? null,
      restaurant_name: rec?.restaurant_name ?? null,
    };

    // Enrich icebreaker with sender_name
    const enrichedIcebreaker = icebreaker ? { ...icebreaker, sender_name: 'blindbite' } : null;

    return NextResponse.json({ chatRequest: enrichedChatRequest, chat: enrichedChat, icebreaker: enrichedIcebreaker });
  }

  const { data: chatRequest, error } = await supabase
    .from('chat_requests')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', body.chatRequestId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich declined chatRequest with display fields
  const cr = await safeSingle<{ craving_id: string | null; recommendation_id: string | null }>(
    supabase.from('chat_requests').select('craving_id, recommendation_id').eq('id', body.chatRequestId).single()
  );
  const craving = await safeSingle<{ user_name: string }>(
    supabase.from('cravings').select('user_name').eq('id', cr?.craving_id ?? '').single()
  );
  const rec = await safeSingle<{ restaurant_name: string | null; recommender_name: string | null }>(
    supabase.from('recommendations').select('restaurant_name, recommender_name').eq('id', cr?.recommendation_id ?? '').single()
  );

  const enrichedChatRequest = {
    ...chatRequest,
    requester_name: craving?.user_name ?? null,
    recommender_name: rec?.recommender_name ?? null,
    restaurant_name: rec?.restaurant_name ?? null,
  };

  return NextResponse.json({ chatRequest: enrichedChatRequest });
}
