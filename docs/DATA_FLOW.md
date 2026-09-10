# 数据链路说明（DATA_FLOW）

> 三条正式数据链路，均以当前真实源码为准（`src/app/api/public/*`、`src/hooks/*`、`src/lib/*`）。

## 1. Published Job → 展示页面

```
Supabase: job_publications (status = 'published')
  关联 jobs → companies（JOIN）
        │
        ▼
GET /api/public/jobs（src/app/api/public/jobs/route.ts）
  · supabase.from('job_publications').select('...jobs!inner(companies!inner(name))')
  · 过滤 status='published'，支持 search / track / city / urgent / limit / offset
  · 输出扁平化 PublicJob[] + total
        │
        ├── 客户端路径（首页 / 岗位中心 / 首页精选岗位）
        │     usePublicJobs()（src/hooks/use-public-jobs.ts）
        │       → fetch('/api/public/jobs?...')
        │       → 页面渲染（Loading / Error / Retry / Empty）
        │
        └── 服务端路径（岗位详情 / 赛道详情）
              jobs/[id]/page.tsx  → fetch('/api/public/jobs/[slug]')   （404 → notFound）
              tracks/[id]/page.tsx → fetch('/api/public/jobs?track=xxx')（force-dynamic）
```

要点：
- 岗位数据唯一来源是 Supabase 已发布 Publication，前端与静态配置中**不存在 Mock 岗位**。
- 详情页按 `slug` 查询；列表页按 `track` 聚合用于赛道计数。
- 服务端页面内部 fetch 走 `localhost:{DEPLOY_RUN_PORT}` 回环。

## 2. Job View → Analytics

```
页面组件（岗位详情页 / 岗位卡片）
  │  trackEvent('job_view' | 'job_impression' | ...)（src/lib/analytics.ts）
  ▼
trackApiEvent(event_type, { publication_id, referrer, metadata }（src/lib/analytics-api.ts）
  │  POST /api/public/events
  ▼
events route（src/app/api/public/events/route.ts）
  · event_type 白名单校验（job_impression / job_view / contact_click /
    apply_start / apply_submit / email_copy / wechat_consult）
  · metadata 脱敏 + 10KB 限制
  · publication_id 必须为合法 UUID（可为空）
  ▼
supabase.rpc('public_track_event', { p_event_type, p_publication_id, p_session_id, p_referrer, p_metadata })
  │
  ▼
Supabase: analytics_events
```

要点：
- 埋点**失败不阻塞主流程**（API 层任何错误都返回 `success: true`）。
- 不记录手机号 / 邮箱等敏感字段（metadata 中会被删除）。
- session_id 由前端生成并保存在 `sessionStorage`。

## 3. Apply → Lead

```
ApplyDrawer（src/components/job/apply-drawer.tsx）
  │  trackEvent('apply_start')
  │  表单校验（姓名必填；手机或邮箱至少一项）
  ▼
useApply()（src/hooks/use-apply.ts）
  │  POST /api/public/apply { full_name, phone, email, publication_id, notes }
  ▼
apply route（src/app/api/public/apply/route.ts）
  · 服务端再校验：姓名长度 ≤ 100、手机 ≤ 30、邮箱 ≤ 200、备注 ≤ 2000、
    publication_id 必须为 UUID
  ▼
supabase.rpc('public_submit_application', { p_publication_id, p_full_name, p_phone, p_email, p_source, p_notes, p_resume_url })
  │
  ▼
Supabase: leads
  · status 强制 'new'（客户端不可指定）
  · site_id 从 publication 自动推导
  · 24h 内同一 publication + 相同 phone/email 不重复创建（业务拒绝 → 409）
```

要点：
- 浏览器**不直接 INSERT** `leads` 表，全部经 `SECURITY DEFINER` RPC。
- RPC 未部署（PGRST202 / 42883）→ 503 `SERVICE_UNAVAILABLE`（投递失败提示重试）。
- 投递成功后前端上报 `apply_submit` 埋点。

## 相关文件索引

| 链路 | 关键文件 |
|------|----------|
| 岗位 | `src/app/api/public/jobs/route.ts`、`[slug]/route.ts`、`src/hooks/use-public-jobs.ts` |
| 埋点 | `src/lib/analytics.ts`、`src/lib/analytics-api.ts`、`src/app/api/public/events/route.ts` |
| 投递 | `src/components/job/apply-drawer.tsx`、`src/hooks/use-apply.ts`、`src/app/api/public/apply/route.ts` |
| 数据库 | `docs/public-write-rpc.sql`（RPC 迁移，需在 Supabase 执行） |
