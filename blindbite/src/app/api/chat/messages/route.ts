import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
  return NextResponse.json({ message: data });
}
