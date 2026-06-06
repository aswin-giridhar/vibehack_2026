import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ chat_id: body.chatId, sender_id: body.senderId, content: body.content, is_icebreaker: false })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: data });
}
