export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  glmApiKey: process.env.GLM_API_KEY || '',
  glmImageApiKey: process.env.GLM_IMAGE_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
} as const;
