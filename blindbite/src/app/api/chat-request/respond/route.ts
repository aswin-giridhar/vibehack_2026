import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.accept) {
    return NextResponse.json({ chatRequest: { id: 'mock-cr1', status: 'accepted', responded_at: new Date().toISOString() }, chat: { id: 'mock-chat1', requester_id: 'demo-aswin-001', recommender_id: 'demo-nicole-001', created_at: new Date().toISOString() }, icebreaker: { id: 'mock-msg1', chat_id: 'mock-chat1', sender_id: 'system', content: 'You both love grilled seafood! 🐙', is_icebreaker: true, created_at: new Date().toISOString() } });
  }
  return NextResponse.json({ chatRequest: { id: 'mock-cr1', status: 'declined', responded_at: new Date().toISOString() } });
}
