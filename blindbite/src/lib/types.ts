export interface User {
  id: string;
  name: string;
  avatar_url: string | null;
  taste_profile: Record<string, unknown>;
  created_at: string;
}

export interface Craving {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'fulfilled' | 'expired';
  created_at: string;
}

export interface Recommendation {
  id: string;
  craving_id: string;
  recommender_id: string;
  recommender_name: string;
  restaurant_name: string;
  restaurant_address: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  vibe_summary: string | null;
  tags: string[];
  is_ai_generated: boolean;
  smart_match_score: number;
  is_best_match: boolean;
  status: string;
  created_at: string;
}

export interface VibeCheck {
  id: string;
  recommendation_id: string;
  craving_id: string;
  requester_id: string;
  recommender_id: string;
  loved_it: boolean;
  chat_requested: boolean;
  created_at: string;
}

export interface ChatRequest {
  id: string;
  recommendation_id: string;
  craving_id: string;
  requester_id: string;
  recommender_id: string;
  status: 'pending' | 'accepted' | 'declined';
  icebreaker: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface Chat {
  id: string;
  chat_request_id: string;
  requester_id: string;
  recommender_id: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_icebreaker: boolean;
  created_at: string;
}

export interface PostCravingRequest {
  userId: string;
  userName: string;
  text: string;
  latitude: number;
  longitude: number;
}

export interface PostRecommendationRequest {
  cravingId: string;
  recommenderId: string;
  recommenderName: string;
  restaurantName: string;
  restaurantAddress?: string;
  latitude: number;
  longitude: number;
}

export interface PostVibeCheckRequest {
  recommendationId: string;
  cravingId: string;
  requesterId: string;
  recommenderId: string;
  lovedIt: boolean;
}

export interface RespondChatRequestRequest {
  chatRequestId: string;
  recommenderId: string;
  accept: boolean;
}
