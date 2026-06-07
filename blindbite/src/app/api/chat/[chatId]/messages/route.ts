import { NextRequest, NextResponse } from 'next/server';
import { supabase, safeSingle } from '@/lib/supabase';

// Resolve a map of sender_id -> display name, batching queries
// and deduplicating lookups. Falls back through cravings then
// recommendations tables to find a user_name.
async function resolveSenderNames(senderIds: string[]): Promise<Map<string, string>> {
  const nameMap = new Map<string, string>();
  const uniqueIds = [...new Set(senderIds)].filter(id => id !== 'system' && id !== 'ai-system');

  // Mark system senders
  nameMap.set('system', 'blindbite');
  nameMap.set('ai-system', 'blindbite');

  // Batch lookup: cravings table (user_id -> user_name)
  if (uniqueIds.length > 0) {
    const { data: cravingRows } = await supabase
      .from('cravings')
      .select('user_id, user_name')
      .in('user_id', uniqueIds);

    for (const row of (cravingRows ?? [])) {
      nameMap.set(row.user_id, row.user_name);
    }

    // Fallback: recommendations table (recommender_id -> recommender_name)
    const unresolved = uniqueIds.filter(id => !nameMap.has(id));
    if (unresolved.length > 0) {
      const { data: recRows } = await supabase
        .from('recommendations')
        .select('recommender_id, recommender_name')
        .in('recommender_id', unresolved);

      for (const row of (recRows ?? [])) {
        if (!nameMap.has(row.recommender_id)) {
          nameMap.set(row.recommender_id, row.recommender_name);
        }
      }
    }
  }

  return nameMap;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Batch-resolve all sender names (deduped — typically just 2 unique senders)
  const senderIds = (data ?? []).map(m => m.sender_id);
  const nameMap = await resolveSenderNames(senderIds);

  const messages = (data ?? []).map(msg => ({
    ...msg,
    sender_name: nameMap.get(msg.sender_id) ?? 'someone',
  }));

  return NextResponse.json({ messages });
}
