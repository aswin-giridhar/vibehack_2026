import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

/** Safe single-row query: returns null instead of throwing on no-match or error.
 *  Accepts the Supabase PostgrestBuilder (which is thenable, not a native Promise). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeSingle<T>(query: any): Promise<T | null> {
  try {
    const { data } = await query;
    return data as T | null;
  } catch {
    return null;
  }
}
