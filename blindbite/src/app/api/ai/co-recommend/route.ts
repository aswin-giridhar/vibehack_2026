import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callAI, callGLMImage, parseAIJson } from '@/lib/ai';
import { DEMO_RESTAURANTS } from '@/data/demo-restaurants';

export async function POST(request: NextRequest) {
  let body: { cravingId: string; cravingText: string; latitude: number; longitude: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.cravingId || !body.cravingText || body.latitude == null || body.longitude == null) {
    return NextResponse.json({ error: 'Missing required fields: cravingId, cravingText, latitude, longitude' }, { status: 400 });
  }

  try {
    const prompt = `A user near London is craving: "${body.cravingText}"

Suggest 2-3 real types of restaurants or specific well-known spots near central London that would satisfy this craving.
Return JSON array:
[
  {
    "name": "Restaurant Name",
    "address": "Approximate address",
    "cuisine_type": "Type",
    "dish_to_image": "specific dish description",
    "vibe_summary": "One sentence vibe",
    "tags": ["tag1", "tag2"]
  }
]
Return ONLY the JSON array.`;

    const raw = await callAI(prompt);
    const suggestions = parseAIJson<Array<{ name: string; address: string; cuisine_type: string; dish_to_image: string; vibe_summary: string; tags: string[] }>>(raw);

    const recommendations = [];
    for (const suggestion of suggestions.slice(0, 3)) {
      let imageUrl: string | null = null;
      try { imageUrl = await callGLMImage(`A beautiful, appetizing food photography style image of ${suggestion.dish_to_image}. Warm lighting, shallow depth of field. No text overlays.`); } catch (e) { console.warn('Image gen failed in co-recommend:', e); }

      const lat = body.latitude + (Math.random() - 0.5) * 0.005;
      const lng = body.longitude + (Math.random() - 0.5) * 0.005;

      const { data } = await supabase
        .from('recommendations')
        .insert({
          craving_id: body.cravingId, recommender_id: 'ai-system', recommender_name: 'AI',
          restaurant_name: suggestion.name, restaurant_address: suggestion.address,
          latitude: lat, longitude: lng, location: `SRID=4326;POINT(${lng} ${lat})`,
          image_url: imageUrl, vibe_summary: suggestion.vibe_summary, tags: suggestion.tags,
          is_ai_generated: true,
        })
        .select()
        .single();

      if (data) recommendations.push(data);
    }
    return NextResponse.json({ recommendations });
  } catch (e) {
    console.warn('AI co-recommend failed, using demo data:', e);
    const fallback = DEMO_RESTAURANTS.slice(0, 2).map((r, i) => ({
      id: `ai-fallback-${i}`, craving_id: body.cravingId, recommender_name: 'AI',
      restaurant_name: r.name, vibe_summary: r.vibe_summary, tags: [...r.tags],
      is_ai_generated: true, latitude: body.latitude + (i + 1) * 0.002, longitude: body.longitude + (i + 1) * 0.002,
    }));
    return NextResponse.json({ recommendations: fallback });
  }
}
