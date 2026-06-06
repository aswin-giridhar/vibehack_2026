import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const body = await request.json();
  const vibeCheck = { id: 'mock-vc1', recommendation_id: body.recommendationId, craving_id: body.cravingId, requester_id: body.requesterId, recommender_id: body.recommenderId, loved_it: body.lovedIt, chat_requested: body.lovedIt, created_at: new Date().toISOString() };
  const chatRequest = body.lovedIt ? { id: 'mock-cr1', recommendation_id: body.recommendationId, craving_id: body.cravingId, requester_id: body.requesterId, recommender_id: body.recommenderId, status: 'pending', icebreaker: null, created_at: new Date().toISOString() } : undefined;
  return NextResponse.json({ vibeCheck, chatRequest });
}
