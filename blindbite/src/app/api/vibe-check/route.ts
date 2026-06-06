import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { callAI } from '@/lib/ai';
import type { PostVibeCheckRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  let body: PostVibeCheckRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.recommendationId || !body.cravingId || !body.requesterId || !body.recommenderId || typeof body.lovedIt !== 'boolean') {
    return NextResponse.json({ error: 'Missing required fields: recommendationId, cravingId, requesterId, recommenderId, lovedIt' }, { status: 400 });
  }

  const { data: vibeCheck, error } = await supabase
    .from('vibe_checks')
    .insert({
      recommendation_id: body.recommendationId, craving_id: body.cravingId,
      requester_id: body.requesterId, recommender_id: body.recommenderId,
      loved_it: body.lovedIt, chat_requested: body.lovedIt,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.lovedIt) {
    const [{ data: craving }, { data: rec }] = await Promise.all([
      supabase.from('cravings').select('text').eq('id', body.cravingId).single(),
      supabase.from('recommendations').select('restaurant_name, vibe_summary').eq('id', body.recommendationId).single(),
    ]);

    let icebreaker = 'You both love great food! 🍽️';
    try {
      const prompt = `Two people just connected over a food recommendation. Person A craved: "${craving?.text}". Person B recommended: "${rec?.restaurant_name}" described as: "${rec?.vibe_summary}".

Generate one warm, fun icebreaker message (max 20 words) that references their shared food interest. Include one relevant emoji. No quotation marks.`;
      icebreaker = await callAI(prompt);
    } catch (e) {
      console.warn('Icebreaker generation failed:', e);
    }

    const { data: chatRequest } = await supabase
      .from('chat_requests')
      .insert({
        recommendation_id: body.recommendationId, craving_id: body.cravingId,
        requester_id: body.requesterId, recommender_id: body.recommenderId,
        status: 'pending', icebreaker,
      })
      .select()
      .single();

    await supabase.from('cravings').update({ status: 'fulfilled' }).eq('id', body.cravingId);
    return NextResponse.json({ vibeCheck, chatRequest });
  }

  return NextResponse.json({ vibeCheck });
}
