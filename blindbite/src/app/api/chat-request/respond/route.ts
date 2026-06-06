import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    const { data: cr } = await supabase.from('chat_requests').select('icebreaker, requester_id, recommender_id').eq('id', body.chatRequestId).single();

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

    return NextResponse.json({ chatRequest, chat, icebreaker });
  }

  const { data: chatRequest, error } = await supabase
    .from('chat_requests')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', body.chatRequestId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ chatRequest });
}
