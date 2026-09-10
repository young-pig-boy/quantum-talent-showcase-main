# 架构说明（ARCHITECTURE）

> 本文基于当前真实源码整理，描述**展示端（Next.js）→ Public API → Supabase** 之间的实际运行关系。

## 一、总体架构

```
┌─────────────────────────────────────────────────────────────┐
│  浏览器（展示端）                                            │
│  ├── 页面路由（App Router）                                  │
│  ├── 客户端 hooks（usePublicJobs / useApply / trackEvent）   │
│  └── 服务端页面组件（岗位详情 / 赛道详情 → 内部 fetch API）   │
└───────────────┬─────────────────────────────────────────────┘
                │ HTTP（同源 /api/*）
┌───────────────▼─────────────────────────────────────────────┐
│  Next.js 服务（src/server.ts 自定义 HTTP 入口，单端口 5000）  │
│  ├── GET  /api/public/jobs          → Supabase SELECT        │
│  ├── GET  /api/public/jobs/[slug]   → Supabase SELECT        │
│  ├── POST /api/public/apply         → RPC public_submit_application
│  └── POST /api/public/events        → RPC public_track_event  │
└───────────────┬─────────────────────────────────────────────┘
                │ @supabase/supabase-js（仅 Publishable Key）
┌───────────────▼─────────────────────────────────────────────┐
│  Supabase（PostgreSQL + RLS + RPC）                          │
│  ├── job_publications / jobs / companies（公开 SELECT）      │
│  ├── leads（仅通过 RPC 写入）                                │
│  └── analytics_events（仅通过 RPC 写入）                     │
└─────────────────────────────────────────────────────────────┘
```

## 二、运行容器与端口

- 所有 HTTP + API 共用**单端口**（默认 `5000`，由 `DEPLOY_RUN_PORT` 注入），`src/server.ts` 用 Next.js `getRequestHandler()` 统一处理页面与 API 路由。
- 开发环境：`scripts/dev.sh` → `pnpm tsx watch src/server.ts`（热更新）。
- 生产环境：`scripts/build.sh`（`next build` + `tsup` 打包 server）→ `scripts/start.sh` → `node dist/server.js`。

## 三、Supabase 连接方式

| 层 | 文件 | 说明 |
|----|------|------|
| 配置 | `src/lib/supabase/config.ts` | 从环境变量读取 URL 与 Publishable Key，缺失即抛错 |
| 服务端 | `src/lib/supabase/server.ts` | 单例 client，API Routes 使用，`db.timeout: 30000` |
| 浏览器 | `src/lib/supabase/client.ts` | 单例 client，`autoRefreshToken: false`（无用户登录态） |

- 仅使用 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`（公开密钥），**不存在 Service Role / Secret Key**。
- 读操作依赖 RLS 公开 SELECT 策略；写操作依赖 RPC（`SECURITY DEFINER`）。

## 四、API 层职责

### 1. GET /api/public/jobs（岗位列表）
- 直接 `supabase.from('job_publications').select(...)`（关联 `jobs`、`companies`）。
- 强制 `status = 'published'`，支持 `search / track / city / urgent / limit / offset`。
- 返回扁平化 `PublicJob[]` + `total`。
- 数据库错误 → 500；不暴露原始 SQL 错误给客户端（`error.message` 目前在响应中透传，见 KNOWN_ISSUES）。

### 2. GET /api/public/jobs/[slug]（岗位详情）
- 按 `slug + status='published'` 单条查询，未命中 → 404。

### 3. POST /api/public/apply（投递）
- 服务端校验：姓名必填、手机/邮箱至少一项、`publication_id` 必须为 UUID、长度限制。
- 调用 `supabase.rpc('public_submit_application', {...})`。
- RPC 未部署（PGRST202 / 42883）→ 503；业务拒绝（重复提交等）→ 409；其他 → 500。

### 4. POST /api/public/events（埋点）
- `event_type` 白名单：`job_impression / job_view / contact_click / apply_start / apply_submit / email_copy / wechat_consult`。
- metadata 脱敏（删除 phone / email / full_name / apikey / token）与大小限制（10 KB）。
- 调用 `supabase.rpc('public_track_event', {...})`。
- **任何失败都返回 `success: true`**（埋点不阻塞主流程）。

## 五、页面层数据获取方式

| 页面 | 获取方式 | 说明 |
|------|----------|------|
| 首页各 Section | `usePublicJobs()` 客户端 fetch | Loading / Error / Retry |
| 岗位中心 | `usePublicJobs()` 客户端 fetch + 前端筛选 | 同上 |
| 岗位详情 | **服务端** fetch `http://localhost:{DEPLOY_RUN_PORT}/api/public/jobs/[slug]` | 404 → `notFound()`；API 异常 → error boundary |
| 赛道详情 | **服务端** fetch `/api/public/jobs?track=xxx` | `force-dynamic`；API 异常降级为空列表 |
| 赛道入口 `/tracks` | redirect → `/#quantum-tracks` | 首页锚点 |

服务端页面内部 fetch 使用 `localhost:{DEPLOY_RUN_PORT}` 回环调用自身 API（单机部署前提，见 KNOWN_ISSUES）。

## 六、数据库安全模型

- **读**：`job_publications / jobs / companies` 开放公开 SELECT（RLS），展示端只能读到已发布岗位。
- **写**：`leads / analytics_events` **不开放**匿名直接 INSERT，全部写入经 `SECURITY DEFINER` RPC：
  - `public_submit_application`：校验 publication 存在且 published、必填字段、`status` 强制 `new`、`site_id` 自动推导、24h 防重复。
  - `public_track_event`：event_type 白名单、metadata 大小限制。
- 迁移文件：`docs/public-write-rpc.sql`（需要在 Supabase SQL Editor 执行，可重复执行）。
- `docs/legacy/rls-policies.sql`：旧版"公开 INSERT 策略"方案，**已废弃，禁止执行**。

## 七、静态配置（前端本地）

| 文件 | 内容 |
|------|------|
| `src/lib/data/tracks.ts` | 4 个 Track 的完整 taxonomy（技术路线 / 应用方向 / 人才类型），独立于岗位数据 |
| `src/lib/data/partners.ts` | 合作机构展示数据 |
| `src/lib/data/site-config.ts` | 站点文案、联系方式（邮箱 / 微信 / 二维码）、Hero 背景图路径、SEO |
| `src/lib/data/navigation.ts` | 导航项与品牌配置（嘉驰国际 Logo） |

岗位数据 **不** 在静态配置中，全部来自 Supabase（正式链路 Mock = 0）。
