import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ recommendation: { id: 'mock-r1', craving_id: body.cravingId, recommender_name: body.recommenderName, restaurant_name: body.restaurantName, image_url: '/mock/octopus.jpg', vibe_summary: 'Cozy Portuguese spot, their octopus is legendary', tags: ['cozy', 'seafood'], is_ai_generated: false, smart_match_score: 0.9, is_best_match: true, latitude: body.latitude, longitude: body.longitude, status: 'active', created_at: new Date().toISOString() } });
}
export async function GET(request: NextRequest) {
  const cravingId = new URL(request.url).searchParams.get('cravingId');
  return NextResponse.json({ recommendations: [
    { id: 'mock-r1', craving_id: cravingId, recommender_name: 'nicole', restaurant_name: 'O Pescador', image_url: '/mock/octopus.jpg', vibe_summary: 'Cozy Portuguese spot, their octopus is legendary', tags: ['cozy', 'seafood'], is_ai_generated: false, smart_match_score: 0.9, is_best_match: true, latitude: 51.508, longitude: -0.126, created_at: new Date().toISOString() },
    { id: 'mock-r2', craving_id: cravingId, recommender_name: 'AI', restaurant_name: 'Casual Seafood Grill', image_url: '/mock/grill.jpg', vibe_summary: 'Lively spot known for fresh catches', tags: ['lively', 'grilled'], is_ai_generated: true, smart_match_score: 0.7, is_best_match: false, latitude: 51.506, longitude: -0.129, created_at: new Date().toISOString() },
  ]});
}
