/**
 * Supabase 配置 — 使用 NEXT_PUBLIC_* 环境变量
 * 本项目仅使用 Publishable Key，不引入任何 Service Role / Secret Key。
 */

function getSupabaseConfig(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set');
  }

  return { url, publishableKey };
}

export { getSupabaseConfig };
