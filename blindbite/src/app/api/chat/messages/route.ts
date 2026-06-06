import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ message: { id: 'mock-msg2', ...body, is_icebreaker: false, created_at: new Date().toISOString() } });
}
