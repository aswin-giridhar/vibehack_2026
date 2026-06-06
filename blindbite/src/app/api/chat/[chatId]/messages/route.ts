import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ messages: [
    { id: 'mock-msg1', chat_id: 'mock-chat1', sender_id: 'system', content: 'You both love grilled seafood! 🐙', is_icebreaker: true, created_at: new Date().toISOString() },
  ]});
}
