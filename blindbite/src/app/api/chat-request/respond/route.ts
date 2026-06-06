import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.accept) {
    const { data: chatRequest } = await supabase
      .from('chat_requests')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', body.chatRequestId)
      .select()
      .single();

    const { data: cr } = await supabase.from('chat_requests').select('icebreaker, requester_id, recommender_id').eq('id', body.chatRequestId).single();

    const { data: chat } = await supabase
      .from('chats')
      .insert({ chat_request_id: body.chatRequestId, requester_id: cr?.requester_id, recommender_id: cr?.recommender_id })
      .select()
      .single();

    const { data: icebreaker } = await supabase
      .from('chat_messages')
      .insert({ chat_id: chat?.id, sender_id: 'system', content: cr?.icebreaker || 'You both love great food! 🍽️', is_icebreaker: true })
      .select()
      .single();

    return NextResponse.json({ chatRequest, chat, icebreaker });
  }

  const { data: chatRequest } = await supabase
    .from('chat_requests')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', body.chatRequestId)
    .select()
    .single();

  return NextResponse.json({ chatRequest });
}
