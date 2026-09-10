# 量子科技人才展示网站（quantum-talent-showcase）

面向量子科技候选人的高端人才展示门户 **第一版前端 Demo**（候选人展示侧）。核心体验路径：品牌认知 → 了解量子价值 → 选择技术赛道 → 查看岗位机会 → 进入岗位详情 → 投递或咨询。

> 本仓库为展示网站前端 + Public API，不包含招聘管理后台。岗位数据来自 Supabase 已发布的 `JobPublication`，正式链路无任何 Mock 数据。

## 项目定位

- 展示量子科技行业（超导量子 / 离子阱 / 光量子 / 量子通信与测量）的稀缺人才机会
- 只读展示 + 在线投递 + 行为埋点，非完整招聘系统
- 视觉基调：**Human Exploration × Quantum Frontier**（深空暗色 + 地平线金强调色），详见 `DESIGN.md`

## 当前功能

| 模块 | 说明 |
|------|------|
| 首页 | 单页滚动叙事：Hero / 为什么关注量子 / 岗位快车道（急招 + 精选 + 赛道 + 全部机会）/ 合作机构 / 加入人才网络 |
| 赛道概览 + 详情 | 4 个静态 Track 详情页（技术路线 / 应用方向 / 人才类型 / 相关岗位） |
| 岗位中心 | 搜索 + 赛道/城市筛选（Popover 下拉）+ 杂志目录式岗位列表 + 真正分页（PAGE_SIZE=20），含 Loading / Error / Retry / Empty 状态 |
| 岗位详情 | 职责 / 要求 / 同赛道岗位，液态玻璃侧边栏（投递/咨询/分享/邮箱微信/二维码），移动端底部固定投递栏 |
| 岗位编号 | 全链路展示 `public_job_code`（QJ-26-XXXX 格式），Showcase 只读不生成 |
| 在线投递 | 表单校验 → `POST /api/public/apply` → RPC 写入 leads |
| 行为埋点 | 10 类事件（page_view / track_click / job_view / job_impression / share / contact_click / apply_start / apply_submit / email_copy / wechat_consult）→ RPC 写入 analytics_events，失败不阻塞主流程 |
| 中英双语 | 轻量 LanguageMode 切换（zh/en），覆盖固定 UI 文案、Track 英文名、城市名映射；岗位动态内容保持中文原文 |

## 技术栈

- **Framework**: Next.js 16（App Router，自定义 `src/server.ts` HTTP 入口）
- **Core**: React 19
- **Language**: TypeScript 5（strict）
- **UI**: shadcn/ui（Radix UI）+ Tailwind CSS 4
- **Styling**: Tailwind CSS 4 + stylelint
- **数据**: Supabase（`@supabase/supabase-js`，仅 Publishable Key）
- **包管理**: pnpm（`only-allow` 强制）

## 项目结构

```
.
├── .env.example             # 环境变量示例（不含真实值）
├── docs/
│   ├── ARCHITECTURE.md      # 架构说明（展示端 / API / Supabase）
│   ├── DATA_FLOW.md         # 数据链路（岗位 / 埋点 / 投递）
│   ├── KNOWN_ISSUES.md      # 已知问题与限制
│   ├── public-write-rpc.sql # 当前正式 RPC 迁移（投递 + 埋点，需在 Supabase 执行）
│   ├── legacy/              # 已废弃文档（DO NOT EXECUTE）
│   ├── design.md            # 设计 DNA
│   └── ui-audit.md          # UI 审计记录
├── public/                  # 静态资源（Hero 背景、二维码、企业 Logo）
├── scripts/                 # dev / build / start / validate 脚本
└── src/
    ├── app/
    │   ├── page.tsx                     # 首页
    │   ├── tracks/page.tsx              # 赛道入口（redirect → /#quantum-tracks）
    │   ├── tracks/[id]/page.tsx         # 赛道详情（force-dynamic）
    │   ├── opportunities/page.tsx       # 岗位中心
    │   ├── jobs/[id]/page.tsx           # 岗位详情（服务端 fetch）
    │   ├── api/public/jobs/route.ts     # GET 岗位列表
    │   ├── api/public/jobs/[slug]/route.ts # GET 岗位详情
    │   ├── api/public/jobs/filter-options/route.ts # GET 筛选选项
    │   ├── api/public/apply/route.ts    # POST 投递
    │   ├── api/public/events/route.ts   # POST 埋点
    │   ├── layout.tsx / globals.css     # 根布局与全局样式
    │   └── robots.ts                    # robots.txt
    ├── components/
    │   ├── layout/          # navbar / footer
    │   ├── sections/        # 首页各 Section
    │   ├── job/             # ApplyDrawer / JobCard / JobList / JobFilter / ShareButton / JobViewTracker
    │   └── ui/              # shadcn/ui + ScrollReveal + LiquidGlass + Empty + Spinner
    ├── hooks/               # usePublicJobs / usePublicJob / useApply / useFilterState / useScrollSpy / useLanguageMode
    ├── lib/
    │   ├── supabase/        # client / server / config（仅 Publishable Key）
    │   ├── data/            # tracks / partners / site-config / navigation（静态配置）
    │   ├── analytics.ts     # 前端埋点封装
    │   ├── analytics-api.ts # 埋点 HTTP 发送
    │   ├── language-mode.tsx # 中英双语切换（LanguageMode / EText）
    │   ├── localized-helpers.ts # 城市名/状态值本地映射
    │   ├── public-job.ts    # PublicJob 类型与 isUrgentActive helper
    │   ├── public-location.ts # 城市名标准化
    │   ├── contact.ts       # 联系方式配置
    │   └── types/           # 类型定义
    └── server.ts            # 自定义服务端入口
```

## 本地 / 部署环境变量

复制 `.env.example` 为 `.env.local` 并填写（变量名以 `NEXT_PUBLIC_` 开头的会在浏览器端暴露，本项目仅暴露 Supabase URL 与公开密钥）：

| 变量 | 说明 | 示例 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 公开密钥（anon key） | `eyJ...` |
| `DEPLOY_RUN_PORT` | 服务监听端口（平台注入） | `5000` |
| `COZE_PROJECT_DOMAIN_DEFAULT` | 对外访问域名（平台注入，SEO 用） | `https://...` |
| `COZE_PROJECT_ENV` | 环境标识 DEV / PROD（平台注入） | `DEV` |

**安全说明**：本项目全链路仅使用 Publishable Key，不引入 Service Role Key / Secret Key；`leads`、`analytics_events` 的写入通过受控 RPC 完成，浏览器端不直接 INSERT。

## 数据链路

### 岗位数据

```
Supabase job_publications (status = 'published')
  ↓ (服务端 Supabase Client, 直接 SELECT + RLS)
GET /api/public/jobs ｜ GET /api/public/jobs/[slug]
  ↓
usePublicJobs / usePublicJob（前端 hook）｜ 服务端 fetch（岗位详情 / 赛道详情）
  ↓
首页 / 岗位中心 / 赛道详情 / 岗位详情
```

### 投递链路

```
ApplyDrawer（表单）
  ↓
useApply hook → POST /api/public/apply（校验 + UUID 白名单）
  ↓
Supabase RPC public_submit_application（SECURITY DEFINER）
  ↓
leads（status 强制 'new'，site_id 从 publication 推导）
```

### 埋点链路

```
trackEvent（前端）
  ↓
trackApiEvent → POST /api/public/events（event_type 白名单）
  ↓
Supabase RPC public_track_event（SECURITY DEFINER）
  ↓
analytics_events（失败不阻塞主流程）
```

详细说明见 `docs/ARCHITECTURE.md` 与 `docs/DATA_FLOW.md`。

## 页面路由

| 路由 | 页面 | 数据 |
|------|------|------|
| `/` | 首页（单页滚动） | 静态配置 + `usePublicJobs` |
| `/tracks` | 赛道入口 | redirect → `/#quantum-tracks` |
| `/tracks/[id]` | 赛道详情（4 个） | 静态 Track + 服务端 fetch 岗位 |
| `/opportunities` | 岗位中心 | `usePublicJobs` |
| `/jobs/[id]` | 岗位详情 | 服务端 fetch + error boundary |

## Public API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/public/jobs` | 岗位列表（search / track / city / urgent / featured / limit / offset） |
| GET | `/api/public/jobs/[slug]` | 岗位详情（404 → 不存在或已下架） |
| GET | `/api/public/jobs/filter-options` | 筛选选项（返回已发布岗位的唯一赛道与城市列表） |
| POST | `/api/public/apply` | 投递 → RPC → leads |
| POST | `/api/public/events` | 埋点 → RPC → analytics_events |

## Supabase

- Project Ref：`wbpnvbvdotkjhwxhndhz`
- 连接方式：仅 Publishable Key（`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`），受 RLS 约束
- 需要数据库侧预先执行的迁移：`docs/public-write-rpc.sql`（投递 RPC + 埋点 RPC，可在 SQL Editor 中重复执行）
- `docs/legacy/rls-policies.sql` 为已废弃的公开 INSERT 方案，**不要执行**

## Build 方法

```bash
pnpm install        # 安装依赖（仅允许 pnpm）
pnpm dev            # 开发服务器（自定义 server.ts，热更新）
pnpm build          # 生产构建（next build + tsup 打包 server）
pnpm start          # 生产启动（node dist/server.js）
pnpm ts-check       # TypeScript 类型检查
pnpm lint:build     # ESLint
pnpm lint:style     # Stylelint
pnpm validate       # 完整校验
```

## 已知限制

见 `docs/KNOWN_ISSUES.md`（当前真实存在的问题与部署前提）。

## 交接文档

见 `docs/HANDOVER.md`（项目定位、整体关系、数据链路、环境变量、部署说明、接手建议）。
