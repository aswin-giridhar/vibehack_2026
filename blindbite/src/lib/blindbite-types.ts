export type Craving = {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  latitude: number;
  longitude: number;
  status: "active" | "fulfilled" | "expired";
  created_at: string;
};

export type Recommendation = {
  id: string;
  craving_id: string;
  recommender_id: string;
  recommender_name: string;
  restaurant_name: string;
  restaurant_address: string;
  latitude: number;
  longitude: number;
  image_url: string;
  vibe_summary: string;
  tags: string[];
  is_ai_generated: boolean;
  smart_match_score: number;
  is_best_match: boolean;
  created_at: string;
};

export type VibeCheck = {
  id: string;
  recommendation_id: string;
  requester_id: string;
  loved_it: boolean;
  chat_requested: boolean;
  created_at: string;
};

export type ChatRequest = {
  id: string;
  recommendation_id: string;
  requester_id: string;
  requester_name: string;
  recommender_id: string;
  recommender_name: string;
  restaurant_name: string;
  status: "pending" | "accepted" | "declined";
  icebreaker: string;
  created_at: string;
  responded_at: string | null;
};

export type Chat = {
  id: string;
  chat_request_id: string;
  other_user_name: string;
  restaurant_name: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  is_icebreaker: boolean;
  created_at: string;
};