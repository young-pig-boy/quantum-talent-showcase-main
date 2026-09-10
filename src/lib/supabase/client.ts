'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './config';

let browserClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * 浏览器端 Supabase Client（单例）
 * 仅使用 Publishable Key。
 */
export function createBrowserClient() {
  if (browserClient) return browserClient;

  const { url, publishableKey } = getSupabaseConfig();
  browserClient = createSupabaseClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return browserClient;
}
