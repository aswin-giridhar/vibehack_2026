import { NextResponse } from 'next/server';
export async function POST() {
  return NextResponse.json({ recommendations: [
    { id: 'mock-ai-r1', craving_id: 'mock-c1', recommender_name: 'AI', restaurant_name: 'Casual Seafood Grill', image_url: '/mock/grill.jpg', vibe_summary: 'Lively spot known for fresh catches and smoky grills', tags: ['lively', 'grilled', 'casual'], is_ai_generated: true, smart_match_score: 0.7, is_best_match: false, latitude: 51.506, longitude: -0.129, created_at: new Date().toISOString() },
    { id: 'mock-ai-r2', craving_id: 'mock-c1', recommender_name: 'AI', restaurant_name: 'The Octopus House', image_url: '/mock/octopus2.jpg', vibe_summary: 'Hidden gem, charcoal-grilled everything', tags: ['hidden gem', 'grilled', 'seafood'], is_ai_generated: true, smart_match_score: 0.6, is_best_match: false, latitude: 51.509, longitude: -0.124, created_at: new Date().toISOString() },
  ]});
}
