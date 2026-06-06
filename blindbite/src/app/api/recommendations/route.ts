import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callAI, callGLMImage, parseAIJson } from '@/lib/ai';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // 1. Insert base recommendation
  const { data: rec, error } = await supabase
    .from('recommendations')
    .insert({
      craving_id: body.cravingId,
      recommender_id: body.recommenderId,
      recommender_name: body.recommenderName,
      restaurant_name: body.restaurantName,
      restaurant_address: body.restaurantAddress || null,
      latitude: body.latitude,
      longitude: body.longitude,
      location: `SRID=4326;POINT(${body.longitude} ${body.latitude})`,
      is_ai_generated: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2. AI enrichment (best-effort)
  try {
    const { data: craving } = await supabase.from('cravings').select('text').eq('id', body.cravingId).single();

    const enrichmentPrompt = `You are a food and drink expert. Given this restaurant recommendation:
- Restaurant: ${body.restaurantName}
- Craving: ${craving?.text || 'unknown'}

Generate a JSON object:
{
  "vibe_summary": "One warm, descriptive sentence about the vibe",
  "tags": ["3-5 lowercase tags"]
}
Return ONLY the JSON object.`;
    const enrichmentRaw = await callAI(enrichmentPrompt);
    const enrichment = parseAIJson<{ vibe_summary: string; tags: string[] }>(enrichmentRaw);

    let imageUrl: string | null = null;
    try {
      imageUrl = await callGLMImage(`A beautiful, appetizing food photography style image of a signature dish at ${body.restaurantName}. Warm lighting, shallow depth of field, restaurant ambiance. No text overlays.`);
    } catch (e) { console.warn('Image gen failed:', e); }

    const { data: updated } = await supabase
      .from('recommendations')
      .update({ vibe_summary: enrichment.vibe_summary, tags: enrichment.tags, image_url: imageUrl })
      .eq('id', rec.id)
      .select()
      .single();

    return NextResponse.json({ recommendation: updated || rec });
  } catch (e) {
    console.warn('AI enrichment failed:', e);
    return NextResponse.json({ recommendation: rec });
  }
}

export async function GET(request: NextRequest) {
  const cravingId = new URL(request.url).searchParams.get('cravingId');
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('craving_id', cravingId)
    .order('smart_match_score', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recommendations: data });
}
