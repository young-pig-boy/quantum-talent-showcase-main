import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

let serverClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * 服务端 Supabase Client（API Routes 使用）
 * 仅使用 Publishable Key。受 RLS 约束。
 */
export function createServerClient() {
  if (serverClient) return serverClient;

  const { url, publishableKey } = getSupabaseConfig();
  serverClient = createSupabaseClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { timeout: 30000 },
  });
  return serverClient;
}
