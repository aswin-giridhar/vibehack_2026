import { NextRequest, NextResponse } from 'next/server';
import { supabase, safeSingle } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  let body: { chatId: string; senderId: string; content: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.chatId || !body.senderId || !body.content) {
    return NextResponse.json({ error: 'Missing required fields: chatId, senderId, content' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ chat_id: body.chatId, sender_id: body.senderId, content: body.content, is_icebreaker: false })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with sender_name — try cravings first, then recommendations
  let senderName = 'someone';
  if (body.senderId === 'system' || body.senderId === 'ai-system') {
    senderName = 'blindbite';
  } else {
    const craving = await safeSingle<{ user_name: string }>(
      supabase.from('cravings').select('user_name').eq('user_id', body.senderId).limit(1).single()
    );
    if (craving?.user_name) {
      senderName = craving.user_name;
    } else {
      const rec = await safeSingle<{ recommender_name: string }>(
        supabase.from('recommendations').select('recommender_name').eq('recommender_id', body.senderId).limit(1).single()
      );
      senderName = rec?.recommender_name ?? 'someone';
    }
  }

  return NextResponse.json({ message: { ...data, sender_name: senderName } });
}
