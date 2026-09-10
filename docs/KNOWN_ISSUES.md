# 已知问题与限制（KNOWN_ISSUES）

> 只记录当前代码中真实存在的问题或部署前提。均为**展示端 Demo 可接受**但值得注意的项。

## 1. 急招（urgent）标识展示恒为 false

- 位置：`src/app/api/public/jobs/route.ts`、`src/app/api/public/jobs/[slug]/route.ts`
- 问题：列表/详情映射中 `urgent: false` 为**硬编码**；虽然列表查询有条件 `filter('jobs.urgent', 'eq', true)`，但该列是否存在未在代码中确认（注释也标注了不确定性，但代码实际未做跳过处理）。因此：
  - 岗位详情页的"急招"标签不会显示；
  - 若 `jobs.urgent` 列不存在，`urgent=true` 请求可能报错。
- 建议：确认 schema 中 `jobs.urgent` 列后，在 API 映射中透传真实值，并移除不确定的过滤分支。

## 2. 列表 API 透传数据库错误详情

- 位置：`src/app/api/public/jobs/route.ts`（`detail: error.message`）
- 问题：Supabase 查询失败时，原始错误消息通过 `detail` 字段返回给客户端，可能暴露表结构/索引信息。
- 建议：与 apply/events 保持一致，只返回安全的错误文案，日志中保留 `detail`。

## 3. 埋点忽略客户端时间戳

- 位置：`src/lib/analytics-api.ts`（发送 `occurred_at`）→ `src/app/api/public/events/route.ts`（未透传给 RPC）
- 问题：前端上传的 `occurred_at` 未被使用，事件时间由数据库侧决定（RPC 内部默认值）。客户端时间戳目前是无效字段。
- 建议：在 RPC 签名中增加 `p_occurred_at`（可选）并透传，或前端停止发送该字段。

## 4. 服务端页面内部 fetch 依赖 localhost 回环

- 位置：`src/app/jobs/[id]/page.tsx`、`src/app/tracks/[id]/page.tsx` 的 `getBaseUrl()`
- 问题：岗位详情 / 赛道详情通过 `http://localhost:{DEPLOY_RUN_PORT}` 回环请求自身 API。前提是服务与页面同机、且监听在可被 localhost 访问的地址；若部署环境端口/主机与预期不一致会加载失败。
- 建议：生产环境改为使用 `COZE_PROJECT_DOMAIN_DEFAULT` 构造内部请求，或抽成共享数据访问层直接查 Supabase。

## 5. RPC 迁移是投递/埋点的部署前提

- 位置：`src/app/api/public/apply/route.ts`、`src/app/api/public/events/route.ts`
- 问题：若 `docs/public-write-rpc.sql` 未在 Supabase SQL Editor 执行：
  - 投递 → 503 `SERVICE_UNAVAILABLE`（正确降级）；
  - 埋点 → 静默返回 `success: true`（不报错也不落库）。
- 建议：部署清单中显式包含"执行 RPC 迁移"步骤。

## 6. 埋点失败完全静默，无观测手段

- 位置：`src/app/api/public/events/route.ts`
- 问题：为不阻塞主流程，所有埋点错误都返回成功且仅打印服务端日志；线上缺少错误计数/告警，埋点数据丢失难以发现。
- 建议：后续可增加轻量错误统计（如埋点失败计数器接口）或日志检索。

## 7. 首页岗位区域为客户端渲染空态

- 位置：首页 `TracksSection` / `FeaturedJobsSection` 使用 `usePublicJobs()`
- 问题：岗位数据在客户端加载，首屏 SSR 无岗位内容（对 SEO 与首屏体验有限制）；加载期间显示骨架屏。
- 建议：若需 SEO 覆盖岗位列表，可将首页精选岗位改为服务端获取。

## 8. `occurred_at`、`session_id` 等字段的数据库约束未在仓库内验证

- 位置：`src/app/api/public/events/route.ts` 按字段长度截断后传入
- 问题：`analytics_events` 表结构与 RPC 参数的实际约束以数据库为准，仓库内没有迁移文件描述表结构（仅 `docs/public-write-rpc.sql` 描述函数）。若表结构变更，可能产生不匹配。
- 建议：将表结构 DDL 一并纳入 `docs/` 或迁移目录，保证仓库自解释。

---

## 已排除的过时项

- `docs/legacy/rls-policies.sql`：旧版"公开 INSERT 策略"方案，已被 RPC 方案替代，**禁止执行**。
- `src/storage/`：drizzle 脚手架残留（未引用），已删除。
- `src/app/hero-lab/`：开发调试页，已删除。
