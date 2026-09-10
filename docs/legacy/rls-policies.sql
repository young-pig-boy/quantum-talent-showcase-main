-- =============================================
-- [DEPRECATED / DO NOT EXECUTE]
-- =============================================
-- 状态：已废弃，仅存档参考。请勿在数据库中执行本文件！
--
-- 原因：
--   本文件是"直接开放 leads / analytics_events 匿名 INSERT"的旧方案，
--   已被 docs/public-write-rpc.sql 中的受控 RPC 方案（SECURITY DEFINER）
--   完全替代。当前正式代码（POST /api/public/apply、POST /api/public/events）
--   调用的是 public_submit_application / public_track_event 两个 RPC，
--   而不是依赖公开 INSERT 策略。
--
-- 历史背景：
--   旧版因 leads 和 analytics_events 缺少公开 INSERT 策略导致 42501 错误，
--   曾用本文件添加公开策略。该方案存在安全风险（允许任意匿名写入），
--   已废弃。当前数据库实际使用的迁移见 docs/public-write-rpc.sql。
-- =============================================

-- 1. 候选人投递 → leads
DROP POLICY IF EXISTS "leads_公开写入" ON leads;
CREATE POLICY "leads_公开写入" ON leads
  FOR INSERT WITH CHECK (true);

-- 2. 行为埋点 → analytics_events
DROP POLICY IF EXISTS "analytics_events_公开写入" ON analytics_events;
CREATE POLICY "analytics_events_公开写入" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- 1. 候选人投递 → leads
DROP POLICY IF EXISTS "leads_公开写入" ON leads;
CREATE POLICY "leads_公开写入" ON leads
  FOR INSERT WITH CHECK (true);

-- 2. 行为埋点 → analytics_events
DROP POLICY IF EXISTS "analytics_events_公开写入" ON analytics_events;
CREATE POLICY "analytics_events_公开写入" ON analytics_events
  FOR INSERT WITH CHECK (true);
