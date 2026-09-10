# HANDOVER.md — 量子人才 Showcase 交接文档

> 冻结日期：2026-08-21
> 仓库：`leishi335-cell/leishi335-cell-quantum-talent-showcase`
> 本文档基于当前 main 分支源码整理，以代码为准。

---

## 1. 项目定位

Showcase 是量子人才项目的**候选人前台**，主要承担：

```
岗位发现 → 岗位详情 → 投递 / 咨询 → Lead 回流
```

它**不是**完整招聘后台。不包含：
- 岗位的创建 / 编辑 / 发布 / 下线（属于 Console）
- Lead 的查看 / 跟进 / 状态流转（属于 Console）
- 公司 / 客户内部信息管理
- 简历文件上传与存储（当前 ApplyDrawer 仅采集联系方式）

---

## 2. 整体关系

```
Console（管理侧，不在本仓库）
  ↓ 发布岗位
Formal Supabase（共享数据底座）
  ↓ 公开 SELECT / 受控 RPC
Showcase（本仓库，候选人前台）
```

投递回流链路：

```
Showcase 投递（ApplyDrawer）
  ↓ POST /api/public/apply → RPC public_submit_application
Supabase leads 表
  ↓
Console 承接（查看 / 跟进 / 状态流转）
```

**正式 Supabase Project Ref**：`wbpnvbvdotkjhwxhndhz`

> 本文档不包含任何真实 Secret / Key / 密码。

---

## 3. 当前已实现能力

| 能力 | 状态 | 说明 |
|------|------|------|
| 首页（单页滚动叙事） | ✅ 已实现 | Hero / WhyQuantum / JobFastLane / Partners / Join / Footer |
| Job Fast Lane | ✅ 已实现 | 急招 + 精选 + 赛道 + 全部机会，首页内聚合展示 |
| 岗位中心 `/opportunities` | ✅ 已实现 | 搜索 + 赛道/城市筛选（Popover）+ 真正分页（PAGE_SIZE=20） |
| 急招 / 精选 / 前沿赛道 | ✅ 已实现 | `urgent` / `featured` / `track` 参数过滤，含 `isUrgentActive()` 有效期判断 |
| 赛道详情 `/tracks/[id]` | ✅ 已实现 | 4 个静态 Track（超导 / 离子阱 / 光量子 / 通信与测量），服务端 fetch 岗位 |
| 岗位详情 `/jobs/[id]` | ✅ 已实现 | 左 2/3 内容 + 右 1/3 液态玻璃侧边栏，移动端底部固定投递栏 |
| 岗位编号（Job Code） | ✅ 已实现 | 全链路展示 `public_job_code`（QJ-26-XXXX），Showcase 只读不生成 |
| 在线投递 | ✅ 已实现 | 表单校验 → POST /api/public/apply → RPC → leads |
| 行为埋点 | ✅ 已实现 | 10 类事件 → RPC → analytics_events，失败不阻塞主流程 |
| 中英双语 | ✅ 已实现 | 轻量 LanguageMode（zh/en），覆盖固定 UI 文案、Track 英文名、城市名映射；岗位动态内容保持中文 |
| Public API | ✅ 已实现 | 5 个端点（详见下方） |
| 微信咨询 | ✅ 已实现 | WeChatConsultDialog，展示二维码与微信号 |
| 分享按钮 | ✅ 已实现 | ShareButton，复制链接 + 埋点 |

### Public API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/public/jobs` | 岗位列表（search / track / city / urgent / featured / limit / offset） |
| GET | `/api/public/jobs/[slug]` | 岗位详情（404 → 不存在或已下架） |
| GET | `/api/public/jobs/filter-options` | 筛选选项（返回已发布岗位的唯一赛道与城市列表） |
| POST | `/api/public/apply` | 投递 → RPC → leads |
| POST | `/api/public/events` | 埋点 → RPC → analytics_events |

### 未实现 / 不在本仓库范围

- 简历文件上传（ApplyDrawer 仅采集姓名、手机、邮箱、备注）
- 岗位管理（Console 职责）
- Lead 管理（Console 职责）
- 用户登录 / 认证（Showcase 为公开匿名访问）

---

## 4. 核心目录

```
src/
├── app/                    # 页面路由 + API Routes
│   ├── page.tsx            # 首页
│   ├── tracks/             # 赛道入口（redirect）+ 赛道详情
│   ├── opportunities/      # 岗位中心
│   ├── jobs/[id]/          # 岗位详情
│   └── api/public/         # Public API（jobs / apply / events）
├── components/
│   ├── layout/             # navbar / footer
│   ├── sections/           # 首页各 Section（Hero / WhyQuantum / JobFastLane / ...）
│   ├── job/                # ApplyDrawer / JobCard / JobList / JobFilter / JobCode / ShareButton
│   └── ui/                 # shadcn/ui + ScrollReveal + LiquidGlass + Empty + Spinner
├── hooks/                  # usePublicJobs / usePublicJob / useApply / useFilterState / useScrollSpy
├── lib/
│   ├── supabase/           # client / server / config（仅 Publishable Key）
│   ├── data/               # tracks / partners / site-config / navigation / contact（静态配置）
│   ├── analytics.ts        # 前端埋点封装
│   ├── analytics-api.ts    # 埋点 HTTP 发送
│   ├── language-mode.tsx   # 中英双语切换（LanguageModeProvider / EText / EnOnly）
│   ├── localized-helpers.ts # 城市名/状态值中英映射
│   ├── public-job.ts       # PublicJob 类型 + isUrgentActive helper
│   ├── public-location.ts  # 城市名标准化（区县 → 城市 / 省份）
│   ├── contact.ts          # 联系方式配置（邮箱 / 微信 / 二维码）
│   └── types/              # 类型定义（Track / Job / Partner / SiteConfig 等）
docs/                       # 架构 / 数据链路 / 已知问题 / SQL 迁移 / 设计文档
public/                     # 静态资源（Hero 背景、二维码、企业 Logo）
scripts/                    # dev / build / start / validate 脚本
```

---

## 5. 数据链路

### 5.1 岗位读取

```
Supabase: job_publications (status = 'published')
  ↓ 服务端 Supabase Client, SELECT（RLS 约束）
GET /api/public/jobs | GET /api/public/jobs/[slug] | GET /api/public/jobs/filter-options
  ↓
usePublicJobs / usePublicJob（客户端 hook）| 服务端 fetch（岗位详情 / 赛道详情）
  ↓
首页 / 岗位中心 / 赛道详情 / 岗位详情
```

### 5.2 投递 → Lead

```
ApplyDrawer（表单）
  ↓ useApply hook → POST /api/public/apply
  ↓ 服务端校验 + UUID 白名单
Supabase RPC public_submit_application（SECURITY DEFINER）
  ↓
leads（status 强制 'new'，site_id 从 publication 推导，24h 防重复）
```

### 5.3 埋点 → analytics_events

```
trackEvent（前端）
  ↓ trackApiEvent → POST /api/public/events
  ↓ event_type 白名单 + metadata 脱敏
Supabase RPC public_track_event（SECURITY DEFINER）
  ↓
analytics_events（失败不阻塞主流程）
```

---

## 6. 环境变量

### 浏览器可暴露（NEXT_PUBLIC_*）

| 变量 | 用途 | 必需 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 是 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 公开密钥（anon key） | 是 |

### 仅服务端（Server-only）

| 变量 | 用途 | 必需 |
|------|------|------|
| `DEPLOY_RUN_PORT` | 服务监听端口（平台注入，默认 5000） | 是（平台自动注入） |
| `COZE_PROJECT_DOMAIN_DEFAULT` | 对外访问域名（平台注入，SEO metadataBase 用） | 否（有默认值） |
| `COZE_PROJECT_ENV` | 环境标识 DEV / PROD（平台注入） | 否（默认 DEV） |
| `PORT` | 服务端口（由 scripts 从 DEPLOY_RUN_PORT 传入） | 否（脚本自动设置） |
| `HOSTNAME` | 服务主机名 | 否（默认 localhost） |

**安全说明**：本项目全链路仅使用 Publishable Key，**不引入 Service Role Key / Secret Key**。`leads`、`analytics_events` 的写入通过受控 RPC（`SECURITY DEFINER`）完成，浏览器端不直接 INSERT。

---

## 7. 本地运行 / Build

```bash
# 安装依赖（仅允许 pnpm）
pnpm install

# 开发服务器（自定义 server.ts，热更新）
pnpm dev

# 生产构建（next build + tsup 打包 server）
pnpm build

# 生产启动（node dist/server.js）
pnpm start

# TypeScript 类型检查
pnpm ts-check

# ESLint
pnpm lint:build

# Stylelint
pnpm lint:style

# 完整校验（ts-check + lint:build + lint:style 并行）
pnpm validate
```

**前提**：需要 `.env.local` 文件（复制 `.env.example` 并填写真实 Supabase URL 和 Publishable Key）。

---

## 8. 部署说明

- **代码 Source of Truth**：GitHub 仓库 `leishi335-cell/leishi335-cell-quantum-talent-showcase`
- **当前部署/运行环境**：Coze 沙箱（开发 + 预览），端口由 `DEPLOY_RUN_PORT` 环境变量注入
- **数据底座**：Supabase（Project Ref: `wbpnvbvdotkjhwxhndhz`），共享于 Console 与 Showcase
- **域名**：属于外部部署/备案事项，不硬编码在代码中；代码通过 `COZE_PROJECT_DOMAIN_DEFAULT` 环境变量获取

### 部署前检查清单

1. Supabase 侧已执行 `docs/job-publications-anon-read.sql`（anon SELECT 权限）
2. Supabase 侧已执行 `docs/public-write-rpc.sql`（投递 + 埋点 RPC）
3. 环境变量已配置（`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`）
4. `pnpm build` 通过

---

## 9. Known Issues / 未完成事项

详见 `docs/KNOWN_ISSUES.md`，以下为摘要：

### 已完成

- 首页 / Job Fast Lane / 岗位中心 / 岗位详情 / 赛道详情
- 投递链路（ApplyDrawer → API → RPC → leads）
- 埋点链路（trackEvent → API → RPC → analytics_events）
- 岗位编号（public_job_code）全链路展示
- 中英双语（固定 UI 文案 + 城市名映射）
- Public API（5 个端点）

### 已实现但未充分真实 UAT

- 投递 → Lead 链路代码完整，但简历文件未采集（仅联系方式）
- 埋点数据落库后无观测/告警手段（静默失败）
- 中英双语切换在部分边缘场景可能有未覆盖的文案

### 明确未完成

- 简历文件上传与存储
- 埋点失败观测/告警
- 首页岗位区域 SSR（当前为客户端渲染，首屏无岗位内容）

### 已知技术问题

- 列表 API 透传数据库错误详情（应脱敏）
- 服务端页面内部 fetch 依赖 localhost 回环（多实例部署需改造）
- `occurred_at` 客户端时间戳未被使用

### 未来方向（非 Bug）

- 岗位列表 SSR / ISR 优化
- 简历文件上传
- 埋点观测体系
- 多语言深度覆盖（岗位动态内容翻译）

---

## 10. 接手建议

最简路径：

```
README.md
  → HANDOVER.md（本文档）
  → docs/ARCHITECTURE.md（架构详情）
  → docs/DATA_FLOW.md（数据链路详情）
  → docs/KNOWN_ISSUES.md（已知问题）
  → 本地启动（pnpm install → pnpm dev）
  → Formal Supabase（确认 RPC 迁移已执行）
  → 真实页面验证（首页 → 岗位中心 → 岗位详情 → 投递）
```

### 关键文件速查

| 需求 | 文件 |
|------|------|
| 修改联系方式 | `src/lib/contact.ts` |
| 修改 Hero 文案 | `src/lib/data/site-config.ts` |
| 修改赛道信息 | `src/lib/data/tracks.ts` |
| 修改导航结构 | `src/lib/data/navigation.ts` |
| 修改合作机构 | `src/lib/data/partners.ts` |
| 修改岗位列表 API | `src/app/api/public/jobs/route.ts` |
| 修改投递逻辑 | `src/app/api/public/apply/route.ts` + `src/hooks/use-apply.ts` |
| 修改埋点逻辑 | `src/app/api/public/events/route.ts` + `src/lib/analytics.ts` |
| 修改双语切换 | `src/lib/language-mode.tsx` |
| 修改城市标准化 | `src/lib/public-location.ts` |
| Supabase 配置 | `src/lib/supabase/config.ts` |
| RPC 迁移 SQL | `docs/public-write-rpc.sql` + `docs/job-publications-anon-read.sql` |
