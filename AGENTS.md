# AGENTS.md

## 项目概览

量子科技人才招聘网站第一版前端 Demo。面向量子科技候选人的高端人才展示门户，非完整招聘系统，仅包含候选人展示侧：首页、赛道概览与详情、岗位中心、岗位详情、投递/咨询入口。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

### 目录结构

```
├── public/                 # 静态资源（背景图、二维码、企业 Logo）
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由
│   │   ├── page.tsx        # 首页
│   │   ├── tracks/         # 赛道概览 + 赛道详情
│   │   │   ├── page.tsx            # /tracks 赛道列表
│   │   │   └── [id]/page.tsx       # /tracks/[id] 赛道详情
│   │   ├── opportunities/  # 岗位中心
│   │   ├── jobs/[id]/      # 岗位详情页
│   │   ├── layout.tsx      # 根布局
│   │   └── globals.css     # 全局样式
│   ├── components/
│   │   ├── ui/             # shadcn/ui 组件 + ScrollReveal + LiquidGlass
│   │   ├── layout/         # 导航、Footer
│   │   ├── sections/       # 首页各 Section（Hero / WhyQuantum / JobFastLane / UrgentJobs / FeaturedJobs / Tracks / JobCenter / Partners / Join）
│   │   └── job/            # 岗位相关组件（JobCard / JobList / JobFilter / ApplyDrawer / ShareButton）
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/
│   │   ├── utils.ts        # cn 工具
│   │   ├── analytics.ts    # 事件埋点空实现
│   │   ├── types/index.ts  # 类型定义（Track / Job / Partner / SiteConfig 等）
│   │   └── data/           # Mock 数据与配置文件
│   └── server.ts           # 自定义服务端入口
├── docs/                   # 设计审计文档
│   ├── ui-audit.md         # UI 审计报告
│   ├── design.md           # 设计 DNA 文档
│   ├── rls-policies.sql    # 旧版 RLS 策略（已被 RPC 替代）
│   └── public-write-rpc.sql # 安全写入 RPC 迁移文件
├── DESIGN.md               # 视觉与交互设计规范
├── next.config.ts          # Next.js 配置
├── package.json            # 依赖管理
└── tsconfig.json           # TypeScript 配置
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，严禁 npm/yarn。

## 开发规范

- 默认按 TypeScript `strict` 心智编写，禁止隐式 `any` 和 `as any`。
- 函数参数、返回值、事件对象、`catch` 错误需明确类型或先收窄。
- 页面组件不硬编码业务数据，统一从 `src/lib/data/` 读取。
- `next.config.ts` 中不使用硬编码绝对路径。
- 严禁在 JSX 渲染逻辑中直接使用 `typeof window`、`Date.now()`、`Math.random()`；需用 `'use client'` + `useEffect` + `useState`。
- 禁止使用 `head` 标签，优先用 `metadata`。

## 页面与路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 单页滚动叙事，含 Hero、为什么关注量子、岗位快车道（急招 + 精选 + 赛道 + 全部机会）、合作机构、加入人才网络、Footer |
| `/tracks` | 赛道概览 | 四大量子技术赛道列表，编号编辑式布局，每条赛道显示英文名、描述、开放岗位数 |
| `/tracks/superconducting` | 超导量子赛道详情 | Hero（大编号 + 英文名）、赛道概览、技术路线（编号列表）、应用方向、人才类型、相关岗位（杂志式列表）、投递 CTA（液态玻璃） |
| `/tracks/ion-trap` | 离子阱赛道详情 | 同上结构，内容为离子阱技术 |
| `/tracks/photonics` | 光量子赛道详情 | 同上结构，内容为光量子技术 |
| `/tracks/communication-sensing` | 量子通信与测量赛道详情 | 同上结构，内容为量子通信与测量技术 |
| `/opportunities` | 岗位中心 | 支持 URL Query 参数（`urgent=true` / `featured=true` / `track=xxx`）自动应用筛选。服务端搜索筛选（400ms debounce）+ 真正分页（PAGE_SIZE=20）+ Popover 赛道/城市下拉。城市选项来自 `GET /api/public/jobs/filter-options`，赛道选项来自 `getActiveTracks()`。 |
| `/jobs/[id]` | 岗位详情页 | 左 2/3 内容（摘要、职责、要求、同赛道岗位），右 1/3 液态玻璃侧边栏（投递/咨询/分享/邮箱微信/二维码），移动端底部固定投递栏 |

## 导航结构

一级导航（`src/lib/data/navigation.ts`）：

| 导航项 | 目标 | 类型 |
|--------|------|------|
| 首页 | `#hero` | 首页锚点 |
| 岗位快车道 | `#job-fast-lane` | 首页锚点（含二级导航） |
| 合作机构 | `#partners` | 首页锚点 |
| 联系我们 | `#join-network` | 首页锚点 |

二级导航（岗位快车道子菜单）：

| 子项 | 目标 |
|------|------|
| 急招岗位 | `/opportunities?urgent=true` |
| 岗位中心 | `/opportunities` |
| 量子赛道 | `/#quantum-tracks` |
| 精选岗位 | `/opportunities?featured=true` |

CTA"探索岗位"指向 `/opportunities`（独立页面）。

**路由规则**：`isPageRoute: true` 的项使用 Next.js `Link` 组件正常跳转，不会被 `scrollToSection` 拦截。锚点类项在首页触发平滑滚动，非首页跳转至 `/#xxx`。

## 数据来源

### 静态配置（本地维护）

- `site-config.ts` — 站点配置、联系方式、Hero 背景图路径、SEO 信息、Hero 英文标语与双行标题。
- `tracks.ts` — 量子技术赛道定义（名称、描述、技术路线、应用方向、人才类型、heroGradient 等）。Track ID: `superconducting` / `ion-trap` / `photonics` / `communication-sensing`。此为产品 Taxonomy，独立于岗位数据。
- `partners.ts` — 合作机构/企业数据，含 englishName 字段。
- `index.ts` — 统一导出与数据查询函数（getActiveTracks / getTrackById / getPartners）。

### 岗位数据（Supabase → API）

岗位数据唯一正式链路：

```
Supabase job_publications (status = 'published')
  ↓
GET /api/public/jobs (支持 urgent / featured / track / search / city / page / limit 参数)
  ↓
usePublicJobs / usePublicJob (hooks/use-public-jobs.ts)
  ↓
页面组件

补充 API：
- `GET /api/public/jobs/filter-options` — 返回所有 published 岗位的唯一赛道和城市列表（仅 track + city 字段，不含公司信息）
```

- 首页 UrgentJobsSection：`usePublicJobs({ urgent: true, limit: 6 })`，仅展示有效急招（`urgent=true AND (urgent_expires_at IS NULL OR urgent_expires_at > now())`），含 Loading / Error / Empty 状态。
- 首页 FeaturedJobsSection：`usePublicJobs({ featured: true, limit: 6 })`，仅展示 `status=published AND featured=true` 的岗位，含 Loading / Error / Empty 状态。
- 首页 TracksSection：通过 `usePublicJobs()` 获取全部 published 岗位，前端按 `track` 聚合计数，含 Loading / Error / Retry 状态。
- 首页 JobCenterSection：`usePublicJobs({ limit: 5 })`，展示最新 published 岗位，含 Loading / Error / Empty 状态。
- 岗位中心 /opportunities：`usePublicJobs()`，支持 URL Query 参数自动筛选，含 Loading / Error / Retry / Empty 状态。
- 岗位详情 /jobs/[slug]：服务端 `fetch` → `/api/public/jobs/[slug]`，404 → `notFound()`，API 异常 → error boundary（含 Retry）。
- 赛道详情 /tracks/[id]：服务端 `fetch` → `/api/public/jobs?track=xxx`，含 error boundary。

### 急招有效期判断

统一使用 `isUrgentActive(job)` helper（定义在 `hooks/use-public-jobs.ts`）：

```ts
isUrgentActive(job) = job.urgent === true && (!job.urgent_expires_at || new Date(job.urgent_expires_at) > new Date())
```

所有组件（JobCard / JobCenter / FeaturedJobs / UrgentJobs / JobDetail）统一使用此 helper，禁止各自判断。

## 事件埋点

`src/lib/analytics.ts` + `src/lib/analytics-api.ts` 通过 `POST /api/public/events` 写入 `analytics_events` 表。

支持事件类型（白名单）：
- `page_view` / `track_click` / `job_view` / `job_share`
- `email_copy` / `wechat_consult` / `contact_click`
- `apply_start` / `apply_submit` / `job_impression`

埋点失败不阻塞主流程。非法 event_type 在 API 层即被拒绝（400）。

## 安全写入架构

投递和埋点均通过受控 RPC 函数写入，不开放匿名直接 INSERT：

- **投递**：`POST /api/public/apply` → RPC `public_submit_application` → `leads`
- **埋点**：`POST /api/public/events` → RPC `public_track_event` → `analytics_events`

RPC 函数使用 `SECURITY DEFINER`，内部严格校验：
- Publication 必须存在且为 `published`
- 必填字段校验 + 长度限制
- `status` 强制为 `new`，不允许客户端指定
- `site_id` 从 Publication 自动推导
- 24 小时内同一 publication + 相同 phone/email 不重复创建
- Analytics event_type 白名单过滤

SQL 迁移文件：`docs/public-write-rpc.sql`（需在控制台 Supabase SQL Editor 中执行）。

## 构建与测试命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm ts-check     # TypeScript 类型检查
pnpm lint:build   # ESLint 检查
pnpm lint:style   # Stylelint 检查
pnpm validate     # 完整验证
```

## 常见注意事项

- 首页 Hero 背景图路径在 `src/lib/data/site-config.ts` 中配置，可快速替换。
- 联系方式（邮箱、微信号、二维码）也在 `site-config.ts` 中配置。
- 岗位详情返回岗位列表时，通过 `sessionStorage` 保留搜索/筛选状态。
- 移动端岗位详情底部固定"投递 / 咨询"入口。
- 赛道详情页通过 `generateStaticParams` 预生成 4 个赛道路由。
- 液态玻璃效果（`.liquid-glass` / `.liquid-glass-strong`）仅用于导航栏、CTA 按钮背景、投递/咨询面板。
- `ScrollReveal` 组件用于滚动触发动画，支持 `delay` / `duration` / `threshold` / `once` 参数。
- `ApplyDrawer` 接受 `children` 作为触发器，兼容原生 `<button>` 和 shadcn `<Button>`。
- 设计系统详见 `docs/design.md` 和 `DESIGN.md`，配色为深空暗色 + 地平线金强调色。
