import { NextRequest, NextResponse } from 'next/server';
import { supabase, safeSingle } from '@/lib/supabase';

// Map of sender_id -> display name for enrichment
async function resolveSenderName(senderId: string): Promise<string> {
  if (senderId === 'system' || senderId === 'ai-system') return 'blindbite';
  const data = await safeSingle<{ user_name: string }>(
    supabase.from('cravings').select('user_name').eq('user_id', senderId).limit(1).single()
  );
  return data?.user_name ?? 'someone';
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich messages with sender_name
  const messages = await Promise.all((data ?? []).map(async (msg) => ({
    ...msg,
    sender_name: await resolveSenderName(msg.sender_id),
  })));

  return NextResponse.json({ messages });
}
