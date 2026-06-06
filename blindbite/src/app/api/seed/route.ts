import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEMO_USERS } from '@/data/demo-users';

export async function POST() {
  const { error } = await supabase
    .from('users')
    .upsert(DEMO_USERS.map(u => ({ id: u.id, name: u.name, avatar_url: u.avatar_url, taste_profile: u.taste_profile })), { onConflict: 'id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: 'ok', users: DEMO_USERS.length });
}
