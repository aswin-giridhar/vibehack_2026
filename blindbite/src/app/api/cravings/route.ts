import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ craving: { id: 'mock-c1', ...body, status: 'active', created_at: new Date().toISOString() } });
}
