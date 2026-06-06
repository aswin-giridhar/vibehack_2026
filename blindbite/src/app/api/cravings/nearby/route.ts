import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ cravings: [
    { id: 'mock-c1', user_name: 'aswin', text: 'best grilled octopus nearby', latitude: 51.5074, longitude: -0.1278, status: 'active', created_at: new Date().toISOString() },
  ]});
}
