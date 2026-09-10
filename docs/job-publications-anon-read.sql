-- =============================================
-- 公开岗位读取权限修复 — job_publications anon SELECT
-- =============================================
-- 状态：修复 "岗位加载失败"（Showcase 首页 / 岗位中心 / 赛道详情 / 岗位详情）
--
-- 问题：
--   GET /api/public/jobs 返回 500 {"error":"查询岗位列表失败"}
--   Supabase error: 42501 permission denied for table job_publications
--   hint: Grant the required privileges to the current role with:
--         GRANT SELECT ON public.job_publications TO anon;
--
-- 原因：
--   anon 角色对 job_publications 无表级 SELECT 权限，
--   且表已启用 RLS 但缺少允许 anon 读取 published 行的策略。
--
-- 执行方式：
--   在 Supabase Dashboard → SQL Editor 中执行本文件全部语句（可安全重复执行）。
--
-- 安全设计：
--   - 仅开放 SELECT，不开放 INSERT/UPDATE/DELETE
--   - RLS Policy 仅允许读取 status = 'published' 的行，未发布数据不可见
--   - 写入仍走受控 RPC（public_submit_application / public_track_event）
-- =============================================

-- 1. 表级授权：允许 anon 角色 SELECT（PostgREST 以此身份执行公开查询）
GRANT SELECT ON public.job_publications TO anon;

-- 2. RLS 策略：仅允许匿名读取已发布岗位（幂等，可重复执行）
DROP POLICY IF EXISTS "anon_can_read_published_publications" ON job_publications;
CREATE POLICY "anon_can_read_published_publications"
  ON job_publications
  FOR SELECT
  TO anon
  USING (status = 'published');

-- 3.（如适用）RLS 已启用则必须存在上述策略；若表未启用 RLS，仅步骤 1 即可生效。
--    确认 RLS 状态（如未启用可执行下面一行，幂等）：
-- ALTER TABLE public.job_publications ENABLE ROW LEVEL SECURITY;
