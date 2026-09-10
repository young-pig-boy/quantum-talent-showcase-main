# COZE_PROJECT_REALITY.md

> 本文档为「项目级自梳理」事实文档，供 Codex 后续穿透审计使用（交叉审计文件：`docs/CODEX_UJ_PENETRATION_AUDIT.md`）。
>
> 事实优先级：**实际运行代码 > 当前 Coze 环境 > 当前 API Route > 当前 Supabase 真实连接方式 > 当前页面真实交互 > README/docs**。
> 凡旧文档与代码冲突处，均以代码为准，并在文中标注「旧文档已失效」。

---

## 1. Executive Summary

**Showcase 当前是什么（一句话）**：

> 面向量子科技候选人的**岗位发现、岗位详情与公开投递入口**。

**Showcase 当前不是**：

- ❌ 招聘后台
- ❌ ATS（Applicant Tracking System）
- ❌ 猎头工作台
- ❌ 人才库
- ❌ 公司管理后台

**Showcase / Console / Supabase 的关系**：

| 组件 | 角色 | 是否在本仓库 | 说明 |
|------|------|--------------|------|
| **Showcase**（本仓库） | 候选人公开侧前端 + Public API + 受控写入 | ✅ 是 | 只读已发布岗位；通过 RPC 受控写入 `leads` 与 `analytics_events` |
| **Console** | 管理侧（发布岗位、查看 Lead、管理公司） | ❌ 否 | 本仓库不含任何管理后台代码 |
| **Supabase** | 共享数据存储层 | 外部依赖 | 表：`job_publications` / `leads` / `analytics_events`；RPC：`public_submit_application` / `public_track_event` |

**真实技术栈（已核实）**：

- Next.js 16（App Router，Server + Client Components 混合）
- React 19
- TypeScript 5（`strict` 心智，`tsconfig.json` 开启 `noImplicitAny`）
- Tailwind CSS 4 + shadcn/ui（Radix UI）
- Supabase（`@supabase/supabase-js`，**仅 Publishable Key，无 Service Role**）
- 自定义服务端入口 `src/server.ts`（非 `next dev` / `next start` 默认入口）

**当前运行环境（已核实）**：

| 环境变量 | 当前值 | 说明 |
|---------|--------|------|
| `COZE_PROJECT_ENV` | `DEV` | 开发环境（非 `PROD`） |
| `DEPLOY_RUN_PORT` | `5000` | 服务监听端口（主仓固定） |
| `COZE_PROJECT_DOMAIN_DEFAULT` | `https://….dev.coze.site` | 对外访问域名 |
| `COZE_WORKSPACE_PATH` | `/workspace/projects` | 主仓（非 worktree） |

> 注：主仓预览常驻运行（端口 5000），无 `.preview` 文件（`.preview` 仅 worktree 手动预览时存在）。

**核心结论预告**：岗位「发现 → 详情」链路已通过运行时日志验证为**真实可用**；「投递 → Lead」代码链路完整，但存在「简历未采集」这一 UJ 缺口，且 RPC 落库依赖 `docs/public-write-rpc.sql` 迁移已在 Supabase 侧执行。详见第 14 节 UJ 状态矩阵。

---

## 2. 产品责任边界

### 2.1 Showcase 的职责（真实实现）

1. **公开读取**：仅展示 `job_publications` 中 `status = 'published'` 的岗位（列表 + 详情）。
2. **公开投递**：通过 `POST /api/public/apply` → RPC `public_submit_application` 写入 `leads`（不开放匿名直接 INSERT）。
3. **公开埋点**：通过 `POST /api/public/events` → RPC `public_track_event` 写入 `analytics_events`。
4. **静态内容**：赛道 Taxonomy、合作伙伴、联系方式等（`src/lib/data/` 本地维护）。

### 2.2 Showcase 不负责（真实缺失）

- ❌ 岗位的创建 / 编辑 / 发布 / 下线（属于 Console）
- ❌ Lead 的查看 / 跟进 / 状态流转（属于 Console）
- ❌ 公司 / 客户内部信息管理
- ❌ 简历文件上传与存储（**当前 ApplyDrawer 不采集简历文件，仅采集联系方式**，见第 8 节）

---

## 3. Candidate User Journey（逐步事实梳理）

> 状态图例：✅ 已真实实现 · 🟡 部分实现/有风险 · ❌ 未实现 · ❓ 无法确认

### 3.1 进入 Showcase

- ① 页面：首页（Hero + 单页滚动叙事）
- ② 入口：直接访问 `/`
- ③ Route：`/`
- ④ 主要源码：`src/app/page.tsx` → `src/components/sections/*`（Hero / WhyQuantum / JobFastLane / Partners / Join）
- ⑤ 数据来源：Hero 文案与背景来自 `src/lib/data/site-config.ts`；赛道来自 `src/lib/data/tracks.ts`
- ⑥ API/RPC：无（静态渲染）
- ⑦ 成功条件：页面 SSR 200 渲染
- ⑧ 状态处理：静态内容，无 Loading/Error
- ⑨ 可用性：✅ 已真实实现（运行时日志 `GET / 200`）
- ⑩ 风险：无

### 3.2 了解量子科技 / 前沿赛道

- ① 页面：首页「为什么关注量子」「前沿赛道」Section；独立赛道详情页
- ② 入口：首页滚动；`/#quantum-tracks` 锚点；赛道卡片点击 → `/tracks/[id]`
- ③ Route：`/`（锚点）与 `/tracks/superconducting` / `/tracks/ion-trap` / `/tracks/photonics` / `/tracks/communication-sensing`
- ④ 主要源码：`src/components/sections/why-quantum-section.tsx`、`tracks-section.tsx`、`src/app/tracks/[id]/page.tsx`
- ⑤ 数据来源：赛道 Taxonomy 来自 `src/lib/data/tracks.ts`（本地静态）；赛道详情页内岗位来自 `/api/public/jobs?track=xxx`
- ⑥ API：`GET /api/public/jobs?track=xxx`（**赛道详情页为 Server Component self-fetch**，见第 7 节）
- ⑦ 成功条件：赛道静态内容渲染 + 岗位列表返回
- ⑧ 状态处理：赛道详情页有 `error.tsx`（error boundary）；岗位列表为空显示「暂无岗位」
- ⑨ 可用性：🟡 赛道静态内容 ✅，岗位数据依赖 API（已验证可用）
- ⑩ 风险：**赛道详情页仍存在 `localhost` self-fetch**（技术债 T1）

### 3.3 进入岗位快车道

- ① 页面：首页「岗位快车道」Section
- ② 入口：导航「岗位快车道」（`/#job-fast-lane` 锚点）
- ③ Route：`/`（锚点）
- ④ 主要源码：`src/components/sections/job-fast-lane-section.tsx`
- ⑤ 数据来源：无（聚合入口 Section）
- ⑥ API：无
- ⑦ 成功条件：Section 渲染
- ⑧ 状态处理：静态
- ⑨ 可用性：✅
- ⑩ 风险：无

### 3.4 浏览岗位中心 / 急招 / 精选 / 前沿赛道

- ① 页面：首页 `JobCenterSection`（岗位中心）、`UrgentJobsSection`（急招）、`FeaturedJobsSection`（精选）、`TracksSection`（赛道）；独立 `/opportunities` 页
- ② 入口：
  - 首页各 Section 内 CTA / 卡片
  - 导航二级「岗位中心 / 急招 / 精选 / 量子赛道」——**注意：当前二级导航均为首页锚点，非 `/opportunities` 页跳转**（见第 5 节）
  - `/opportunities` 独立页（支持 URL Query 筛选）
- ③ Route：`/`（锚点）与 `/opportunities`
- ④ 主要源码：`src/components/sections/job-center-section.tsx`、`urgent-jobs-section.tsx`、`featured-jobs-section.tsx`、`tracks-section.tsx`、`src/app/opportunities/page.tsx`、`src/components/job/job-filter.tsx`、`job-list.tsx`、`job-card.tsx`
- ⑤ 数据来源：`usePublicJobs(...)` → `/api/public/jobs`
- ⑥ API：`GET /api/public/jobs`（参数 `urgent` / `featured` / `track` / `search` / `city` / `limit` / `offset`）
- ⑦ 成功条件：API 200 且返回 `jobs[]`
- ⑧ 状态处理：每个 Section 均有 Loading / Error（Retry）/ Empty 状态
- ⑨ 可用性：✅（运行时日志 `GET /api/public/jobs?...` 200 且含真实岗位）
- ⑩ 风险：二级导航「岗位中心/急招/精选」不跳转 `/opportunities`（旧文档声称跳转，已失效）

### 3.5 查看具体岗位（岗位详情）

- ① 页面：`/jobs/[id]` 岗位详情页
- ② 入口：岗位卡片 / 岗位列表点击
- ③ Route：`/jobs/[slug]`
- ④ 主要源码：`src/app/jobs/[id]/page.tsx`（Server Component）
- ⑤ 数据来源：`getPublicJobBySlug(slug)` → Supabase 直查（**非 self-fetch，已修复**）
- ⑥ API：无（Server Component 直接调用 `src/lib/public-jobs/server.ts` 的 `getPublicJobBySlug`；`/api/public/jobs/[slug]` 路由存在但**未被页面使用**）
- ⑦ 成功条件：Supabase 返回 published 岗位 → 渲染；无 → `notFound()`
- ⑧ 状态处理：`notFound()` → 404；Supabase 异常 → `error.tsx`（error boundary + Retry）
- ⑨ 可用性：✅（运行时日志 `GET /jobs/… 200` + `GET /jobs/… 404` 均正常）
- ⑩ 风险：无 self-fetch；但存在「重复详情查询逻辑」（技术债 T3）

### 3.6 查看岗位详情

- ① 页面：`/jobs/[id]` 内容区（左 2/3：摘要/职责/要求/同赛道岗位；右 1/3：液态玻璃投递/咨询/分享面板）
- ② 入口：同上
- ③ Route：`/jobs/[slug]`
- ④ 主要源码：`src/app/jobs/[id]/page.tsx` + `src/components/job/apply-drawer.tsx` + `share-button.tsx` + `job-view-tracker.tsx`
- ⑤ 数据来源：`getPublicJobBySlug` + `getRelatedJobs(track, slug)`
- ⑥ API：无（Server Component 直查）
- ⑦ 成功条件：详情 + 相关岗位渲染
- ⑧ 状态处理：`notFound()` / error boundary
- ⑨ 可用性：✅
- ⑩ 风险：`getRelatedJobs` 在 `track = ''`（track=null）时返回 `[]`，同赛道岗位为空（符合预期）

### 3.7 提交简历 / 联系方式

- ① 页面：ApplyDrawer（投递抽屉表单）
- ② 入口：岗位详情「投递」按钮（桌面右侧面板 + 移动端底部固定栏）
- ③ Route：`/jobs/[slug]`（抽屉内，无独立路由）
- ④ 主要源码：`src/components/job/apply-drawer.tsx` + `src/hooks/use-apply.ts`
- ⑤ 数据来源：用户输入
- ⑥ API：`POST /api/public/apply`
- ⑦ 成功条件：API 返回 `success: true`
- ⑧ 状态处理：提交中禁用按钮；成功后显示成功态；失败显示错误信息；重复提交返回 409 并提示
- ⑨ 可用性：🟡 **表单只采集 `姓名 / 手机 / 邮箱 / 备注`，不采集简历文件（`resume_url` 恒为 null）**（技术债 T2）
- ⑩ 风险：见第 8 节

### 3.8 写入 Lead

- ① 页面：无（后端）
- ② 入口：`POST /api/public/apply`
- ③ Route：`/api/public/apply`
- ④ 主要源码：`src/app/api/public/apply/route.ts`
- ⑤ 数据来源：RPC `public_submit_application`
- ⑥ RPC：`public_submit_application(p_publication_id, p_full_name, p_phone, p_email, p_source, p_notes, p_resume_url)`
- ⑦ 成功条件：RPC 返回 `success: true`
- ⑧ 状态处理：RPC 不存在 → 503；重复提交 → 409；字段非法 → 400
- ⑨ 可用性：🟡 代码链路完整；落库依赖 `docs/public-write-rpc.sql` 迁移已在 Supabase 执行（运行时日志未见 `POST /api/public/apply`，无法从日志直接验证落库）
- ⑩ 风险：见第 8 节

### 3.9 等待猎头沟通

- ① 页面：无（Lead 落库后的线下动作）
- ② 入口：Lead 进入 `leads` 表，由 Console / 猎头侧跟进
- ③ Route：无
- ④ 主要源码：无（Showcase 不负责）
- ⑤ 数据来源：`leads` 表
- ⑥ API：无
- ⑦ 成功条件：Lead 落库成功，Console 侧可见
- ⑧ 状态处理：无
- ⑨ 可用性：❓ Showcase 侧无法确认 Console 是否一定可见（跨系统依赖）
- ⑩ 风险：见第 8 节问题 14

## 4. 当前信息架构（真实）

```
首页 /
├─ Hero
├─ WhyQuantum（为什么关注量子）
├─ JobFastLane（岗位快车道）
│   ├─ JobCenter（岗位中心）        → 首页 Section，最新 published 岗位
│   ├─ UrgentJobs（急招岗位）       → 首页 Section，urgent 有效岗位
│   ├─ FeaturedJobs（精选岗位）     → 首页 Section，featured 岗位
│   └─ Tracks（前沿赛道）           → 首页 Section，4 赛道聚合计数
├─ Partners（合作机构）
└─ Join（加入人才网络 / 联系我们）

/tracks            → 重定向到 /#quantum-tracks（无独立列表页）
/tracks/[id]       → 赛道详情（4 个静态 Track，Server Component self-fetch 岗位）
/opportunities     → 岗位中心独立页（搜索 + 赛道/城市筛选 + 分页）
/jobs/[slug]       → 岗位详情（Server Component 直查）
```

### 4.1 岗位中心（JobCenter / Opportunities）实际查询规则

- **首页 JobCenterSection**：`usePublicJobs({ limit: 5 })` → `/api/public/jobs?limit=5`
  - 后端：`status = 'published'`，按 `published_at` 降序，取前 5。
- **独立 `/opportunities` 页**：`usePublicJobs()`（不传 limit）
  - 后端查询：`status = 'published'`
  - 筛选：
    - `search` → `.or('public_title.ilike.%<search>%,city.ilike.%<search>%')`
    - `track` → `.eq('track', <track>)`
    - `city` → `.eq('city', <city>)`
    - `urgent` → `.eq('urgent', true).or('urgent_expires_at.is.null,urgent_expires_at.gt.<now>')`
    - `featured` → `.eq('featured', true)`
  - 排序：`published_at` 降序
  - 分页：`offset` + `limit`（客户端 `PAGE_SIZE` 控制；**非 `page` 参数**）
  - **400ms debounce 是客户端行为**（`/opportunities` 页内对 `search` 输入做 debounce 后再调 API），后端无 debounce。

### 4.2 急招岗位（UrgentJobs）实际查询规则

- `usePublicJobs({ urgent: true, limit: 6 })` → `/api/public/jobs?urgent=true&limit=6`
- 后端：`.eq('urgent', true).or('urgent_expires_at.is.null,urgent_expires_at.gt.<now>')`
- **是，判断了 `urgent_expires_at`**：过期急招（`urgent_expires_at <= now`）会被过滤。
- 补充：前端还有 `isUrgentActive(job)` helper（`src/lib/public-job.ts`）用于详情页/卡片急招徽标的二次判断。

### 4.3 精选岗位（FeaturedJobs）实际查询规则

- `usePublicJobs({ featured: true, limit: 6 })` → `/api/public/jobs?featured=true&limit=6`
- 后端：`.eq('featured', true)`（叠加 `status = 'published'`）。
- **不判断 `urgent_expires_at`**（精选与急招相互独立）。

### 4.4 前沿赛道（Tracks）实际 Taxonomy

正式 Track（`src/lib/data/tracks.ts`，`getActiveTracks()` 过滤 `status === 'active'`）：

| Track ID | 中文名 |
|----------|--------|
| `superconducting` | 超导量子 |
| `ion-trap` | 离子阱 |
| `photonics` | 光量子 |
| `communication-sensing` | 量子通信与测量 |

- **`track = null` 合法**：后端岗位 `track` 字段可为空。Mapper 将 `null` 映射为 **空字符串 `''`**（非 `null`）。
- `track = null` 岗位：出现在「全部岗位」列表中，但**不会被任何 `track=xxx` 筛选命中**；详情页正常打开（详情用 `slug` 定位，不依赖 track）。
- 首页 TracksSection 聚合计数：前端按 `track` 字段分组；`''` 会被归入「未分类/其他」或不展示（取决于前端聚合逻辑），**不会报错**。

> 未重新发明 Taxonomy：正式 Track 即上述 4 个，`track=null` 是合法业务态。

## 5. 导航体系真实状态

### 5.1 一级 Navbar（桌面 + 移动）

- 定义：`src/lib/data/navigation.ts` 的 `navItems`
- 4 个一级项（全部为首页锚点，`isPageRoute` 均为 falsy）：
  1. 首页 → `#hero`
  2. 岗位快车道 → `#job-fast-lane`
  3. 合作机构 → `#partners`
  4. 联系我们 → `#join-network`
- CTA「探索岗位」（`ctaNavItem`，href `/opportunities`，`isPageRoute: true`）：
  - **仅移动端菜单底部渲染**；桌面端导航栏**不渲染**该 CTA 按钮。

### 5.2 Secondary Nav（岗位快车道二级导航）

- 定义：`navigation.ts` 的 `jobFastLaneSubItems`
- 4 个二级项（**全部为首页锚点，无 `isPageRoute`**）：
  1. 岗位中心 → `#job-center`
  2. 急招岗位 → `#urgent-jobs`
  3. 精选岗位 → `#featured-jobs`
  4. 量子赛道 → `#quantum-tracks`

> ⚠️ **旧文档已失效**：`AGENTS.md` 的导航表声称「急招岗位 → `/opportunities?urgent=true`、岗位中心 → `/opportunities`、精选岗位 → `/opportunities?featured=true`」为**页面路由跳转**；但当前 `navigation.ts` 实际实现为**全部首页锚点滚动**。真实跳转到 `/opportunities` 页的入口是：首页 CTA 按钮、移动端菜单底部「探索岗位」、直接访问 URL。

### 5.3 ScrollSpy / Active Indicator

- 文件：`src/hooks/use-scroll-spy.ts` + `src/components/layout/navbar.tsx`
- 控制者：`useScrollSpy({ sectionIds, offset: 160 })`
- 激活逻辑：固定触发线（`offset = 160px`），取「`section.top <= offset` 的最后一个 section」为 active。
- **是否由滚动位置驱动**：是（纯滚动驱动）。
- **是否存在 Click State**：否（源码注释明确「active 状态完全由滚动驱动，不维护 click state」）。
- **focus-visible**：使用 `focus-visible:`（非 `focus:`）做键盘焦点高亮。
- 一级与二级对应：二级 active 由同一 `useScrollSpy` 结果派生（`activeSection` 命中对应 `sectionId` 时高亮）。

### 5.4 Scroll Progress

- 文件：`src/components/layout/scroll-progress.tsx`
- 挂在 Navbar 内，随页面滚动显示顶部进度条（纯视觉）。

### 5.5 Mobile Navigation

- 文件：`src/components/layout/navbar.tsx` 内的 `MobileSubNav` + shadcn `Sheet`
- 一级项：可展开「岗位快车道」显示 4 个二级锚点项。
- 底部：渲染「探索岗位」CTA（`/opportunities` 页跳转）。

### 5.6 Section ID 全集

`src/lib/data/navigation.ts` 的 `allSectionIds`：

```
hero, why, job-fast-lane, job-center, urgent-jobs, featured-jobs, quantum-tracks, partners, join-network
```

---

## 6. 岗位数据链路

### 6.1 链路全景

```
Supabase (job_publications, status='published')
  ↓  [列表] Route Handler 内联查询
GET /api/public/jobs
  ↓  usePublicJobs (hooks/use-public-jobs.ts)
JobCard / Opportunities / 首页各 Section
```

```
Supabase (job_publications)
  ↓  [详情] getPublicJobBySlug (lib/public-jobs/server.ts)
Server Component /jobs/[slug]
```

### 6.2 关键问题逐条回答

1. **Supabase Project Ref 由哪个环境变量提供？**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://wbpnvbvdotkjhwxhndhz.supabase.co`（Project Ref = `wbpnvbvdotkjhwxhndhz`）。
   - 读取点：`src/lib/supabase/config.ts`。

2. **Publishable Key 还是 Service Role？**
   - **Publishable Key**（`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`，`sb_publishable_…`）。
   - 本仓库代码**不使用 Service Role**。

3. **哪些读操作直接访问 Supabase？**
   - 详情页 Server Component：`getPublicJobBySlug` / `getRelatedJobs`（`src/lib/public-jobs/server.ts`）→ `createServerClient()` 直查。

4. **哪些通过 Route Handler？**
   - 岗位列表：`GET /api/public/jobs`（route 内联 Supabase 查询）。
   - 筛选选项：`GET /api/public/jobs/filter-options`。
   - 投递：`POST /api/public/apply`。
   - 埋点：`POST /api/public/events`。

5. **列表与详情是否复用同一 Mapper / Data Contract？**
   - **复用同一 Mapper**：`mapPublicationToPublicJob`（`src/lib/public-jobs/mapper.ts`）与 `PUBLIC_JOB_FIELDS` 白名单。
   - **但 TypeScript 类型存在双定义**：规范类型在 `src/lib/public-job.ts`；另有一份旧 `PublicJob` 在 `src/lib/supabase/types.ts`（**无任何 import，死代码**，见技术债 T4）。
   - 详情查询逻辑**重复实现两处**：`getPublicJobBySlug`（server.ts）与 `GET /api/public/jobs/[slug]`（route.ts），后者未被页面使用（技术债 T3）。

6. **Server Component 是否仍存在 localhost self-fetch？**
   - **岗位详情页：已修复，无 self-fetch**（`getPublicJobBySlug` 直查）。
   - **赛道详情页：仍存在 self-fetch**（`src/app/tracks/[id]/page.tsx` 通过 `getBaseUrl()` = `http://localhost:${DEPLOY_RUN_PORT}` 调 `/api/public/jobs`）（技术债 T1）。

7. **是否仍存在 Server Component 调用 Client Module runtime function？**
   - 未发现。`getPublicJobBySlug` / `getRelatedJobs` 均为 server-only 函数（`createServerClient`）。

8. **当前 Job Detail 的真实实现？**
   - `src/app/jobs/[id]/page.tsx` 为 **async Server Component**：
     - `generateMetadata` → `getPublicJobBySlug(id)`
     - `page` → `getPublicJobBySlug(id)`；`if (!job) notFound()`
     - `getRelatedJobs(job.track, job.slug)`
   - 数据直连 Supabase，**不经过 `/api/public/jobs/[slug]`**。

9. **Offline 岗位为什么不会被看到？**
   - 所有读路径强制 `.eq('status', 'published')`（列表 + 详情 + filter-options + related）。非 `published` 岗位天然不可见。

10. **track=null 岗位能否正常打开详情？**
    - 能。详情用 `slug` 定位（`getPublicJobBySlug`），不依赖 track。
    - Mapper 将 `track=null` → `''`；`getRelatedJobs('', slug)` 返回 `[]`；`getTrackById('')` 返回 `null`（不渲染赛道标签）。

---

## 7. Public Job 数据契约

### 7.1 规范 PublicJob 字段（`src/lib/public-job.ts`）

| 字段 | 类型 | 来源 DB 列 |
|------|------|-----------|
| `id` | string | `id` |
| `slug` | string | `slug` |
| `title` | string | `public_title`（**非 `title`**） |
| `track` | string | `track`（**null → `''`**） |
| `city` | string | `city` |
| `education` | string | `education` |
| `experience` | string | `experience` |
| `requirements` | string[] | `requirements` |
| `responsibilities` | string[] | `responsibilities` |
| `salary_display` | string | `salary_display` |
| `published_at` | string | `published_at` |
| `status` | string | `status` |
| `summary` | string | `summary` |
| `direction` | string | `direction` |
| `seniority` | string | `seniority` |
| `tags` | string[] | `tags` |
| `urgent` | boolean | `urgent`（null → `false`） |
| `urgent_started_at` | string \| null | `urgent_started_at` |
| `urgent_expires_at` | string \| null | `urgent_expires_at` |
| `featured` | boolean | `featured`（null → `false`） |

### 7.2 SELECT 白名单（`PUBLIC_JOB_FIELDS`）

```
id, slug, public_title, city, salary_display, responsibilities, requirements,
education, experience, track, status, published_at, summary, direction,
seniority, tags, urgent, urgent_started_at, urgent_expires_at, featured
```

- **不包含**：`title`（原始列）、`public_company_name` / `company_name` / `company`、`owner`、`priority`、`internal_notes` 等内部字段。
- 即：**公开 API 不暴露公司名称与任何内部字段**。

### 7.3 数据库字段 → API 字段 → 前端 DTO 映射

- 单一映射函数 `mapPublicationToPublicJob(row)` 负责 DB → DTO。
- 列表 API 与详情 Server Component **共用** `mapPublicationToPublicJob`，因此 **运行时字段结构一致**。
- 类型层不一致点：`src/lib/supabase/types.ts` 的旧 `PublicJob`（缺 `urgent_started_at` / `urgent_expires_at` / `featured`）与规范 `PublicJob` 不一致，但该旧类型**未被任何代码 import（死代码）**，故不产生运行时影响。

> 结论：列表 / 详情 / Server Component 三处的**运行时字段一致**（共用 mapper）；仅存在一份未使用的旧类型定义造成「类型层双定义」技术债。

## 8. 投递 / Lead 链路（重点）

### 8.1 链路全景

```
Job Detail (/jobs/[slug])
  ↓ 点击「投递」
ApplyDrawer（表单：姓名 / 手机 / 邮箱 / 备注）
  ↓ useApply (hooks/use-apply.ts)
POST /api/public/apply
  ↓ 校验 + RPC
RPC public_submit_application（SECURITY DEFINER）
  ↓
Supabase leads 表
```

### 8.2 逐条回答

1. **当前真正使用的写入入口？**
   - `POST /api/public/apply`（Route Handler），前端经 `useApply` hook 调用。

2. **是否使用 `public_submit_application`？**
   - 是。`src/app/api/public/apply/route.ts` 调用 `supabase.rpc('public_submit_application', {...})`。

3. **API Route 在哪？**
   - `src/app/api/public/apply/route.ts`。

4. **RPC 在哪一层被调用？**
   - 服务端（API Route），非浏览器。

5. **Browser 是否直接 INSERT leads？**
   - 否。浏览器仅 `POST /api/public/apply`，不持有 Supabase 写权限路径，无直接 INSERT。

6. **publication_id 如何传递？**
   - ApplyDrawer 的 `job` prop 只取 `id / slug / title / city`（ApplyJobData）；`useApply` 将 `job.id` 作为 `publication_id` 提交。API 层校验其为 UUID 格式。

7. **resume_url 如何处理？**
   - **前端不采集简历文件**，`useApply` 不发送 `resume_url`；API 中 `p_resume_url = null`。
   - 即 `leads.resume_url` 在 Showcase 路径下**恒为 NULL**。

8. **source 如何记录？**
   - 前端不发送 `source`；API 默认 `p_source = 'website'` → 落库到 `leads.source_channel`。

9. **成功后前端显示什么？**
   - `useApply` 返回 `success: true`；ApplyDrawer 显示成功态（`submitted = true`），提示投递成功。

10. **失败如何反馈？**
    - API 返回结构化错误（`success: false` + 安全 message）；前端展示错误信息。
    - RPC 不存在 → 503；重复提交 → 409（`DUPLICATE_SUBMISSION`）；字段非法 → 400。

11. **连点两次会不会重复 Lead？**
    - 客户端：提交中 `submitting` 状态禁用按钮，防止同一轮连点。
    - 关闭抽屉重开并再次提交 = 新请求，客户端不拦截。
    - **DB 层**：RPC 内有 24h 去重（同一 publication + 相同 phone 或 email 不重复创建），返回 `success: false`。

12. **网络重试会不会产生重复 Lead？**
    - 前端无自动重试。用户手动重试会触发新请求，靠 RPC 24h 去重兜底。

13. **是否存在防重复 / 幂等？**
    - **存在逻辑去重**（RPC 内 SELECT 判断），但 **`leads` 表无唯一约束索引**（`docs/SUPABASE_REQUIRED_CHANGES.md` 亦标注此残留风险）。
    - 即存在极小概率 TOCTOU 竞态（并发两请求同时通过 SELECT 检查后双双 INSERT），对 Showcase 场景风险低。

14. **Lead 落库后 Showcase 是否知道 Console 一定能看到？**
    - **Showcase 无法确认**。Showcase 只负责写入 `leads`；Console 是否读取 / 展示 `leads` 属跨系统约定，本仓库无相关代码。

### 8.3 隐私 / 字段边界

- 公开写入仅接受：`publication_id / full_name / phone / email / source / notes / resume_url`（其中 `source` 前端不传、`resume_url` 恒 null）。
- `status` 由 RPC 强制为 `'new'`，客户端不可指定。
- `site_id` 由 RPC 从 publication 自动推导，客户端不可指定。

---

## 9. 公开权限与隐私边界

### 9.1 允许公开读取

- 仅 `job_publications` 中 `status = 'published'` 的岗位，且仅 `PUBLIC_JOB_FIELDS` 白名单字段。
- 赛道 Taxonomy（`tracks.ts`）、合作伙伴、联系方式（`site-config.ts` / `contact.ts`）为本地静态公开内容。

### 9.2 禁止公开（当前实现已隔离）

- ❌ 客户真实内部信息（`public_company_name` 等不在 SELECT 白名单）
- ❌ internal notes / owner / priority（不在白名单）
- ❌ 非公开 Job（`status != 'published'` 强制过滤）
- ❌ Console 数据
- ❌ Talent 数据
- ❌ Lead 列表（无任何公开读取 leads 的 API）
- ❌ Company 内部数据

### 9.3 三层防护的职责

| 层 | 承担作用 |
|----|---------|
| **RLS** | 数据库行级安全：anon 角色仅能读取 `published` 岗位、仅能经 RPC 写入（见 `docs/public-write-rpc.sql`） |
| **GRANT / 权限** | anon 无 `job_publications` / `leads` / `analytics_events` 的直接写权限；写入走 `SECURITY DEFINER` RPC |
| **API 白名单** | `POST /api/public/apply` 字段校验 + UUID 校验 + 长度限制；`POST /api/public/events` event_type 白名单 + 敏感字段剥离 |

> 说明：RLS 的具体 SQL 需在 Supabase SQL Editor 执行（`docs/public-write-rpc.sql`）。本仓库代码层已做到「不直接匿名 INSERT、不暴露内部字段」，但 **RLS 是否已在 Supabase 侧实际生效属部署前提，需在 Supabase 控制台确认**。

---

## 10. Analytics

### 10.1 链路

```
页面/组件 → trackEvent (lib/analytics.ts)
  → trackApiEvent (lib/analytics-api.ts)
  → POST /api/public/events
  → RPC public_track_event
  → analytics_events 表
```

### 10.2 事件白名单（代码 + RPC 一致，共 10 类）

```
page_view, track_click, job_impression, job_view, share,
contact_click, apply_start, apply_submit, email_copy, wechat_consult
```

> ⚠️ **旧文档已失效**：`AGENTS.md` 写的是 `job_share`，但代码与 RPC 实际使用 `share`（无 `job_share`）。`README.md` 声称「7 类事件」，当前实为 10 类。

### 10.3 是否真实落库

- API 层：`POST /api/public/events` 运行时返回 200（日志已验证）。
- 但 `events` route **在 RPC 失败时也返回 `success: true`**（静默降级），故「HTTP 200」不能证明 RPC 实际写库成功；落库是否成功需在 Supabase 侧核对 `analytics_events` 表。

### 10.4 Analytics 失败是否阻断主链路

- **不阻断**（正确）。`events` route 对任何 RPC 异常都返回 `success: true`，不影响岗位浏览 / 投递主流程。
- 符合「业务主链不能因埋点失败而失败」原则。

### 10.5 已知语义问题（非阻断）

- **`job_view` 被复用**：导航点击（一级/二级/移动端）也用 `job_view` + `target` 元数据上报（运行时日志已证实：`[Analytics] job_view {"target":"mobile_subnav_job-center"}`），语义上应为 `track_click` 或独立 `nav_click`，属埋点语义漂移（技术债 T6）。
- **session id 双机制**：`analytics.ts` 在 `sessionStorage` 维护 sessionId 但未传给 API；`analytics-api.ts` 用内存变量另起 sessionId（每次页面加载重置）。两套 session 机制不一致（技术债 T7）。
- **`occurred_at` 被丢弃**：客户端发送 `occurred_at`，但 `events` route 不读取，落库时间以 DB `now()` 为准（无害，但属字段冗余）。

---

## 11. 异常场景清单

| 场景 | 当前处理 | 状态 |
|------|---------|------|
| 岗位不存在（错误 slug） | 详情页 `getPublicJobBySlug` 返回 null → `notFound()` → 404 | ✅ |
| 岗位 Offline（`status != published`） | 所有读路径 `.eq('status','published')` 过滤，等同「不存在」→ 404 / 不展示 | ✅ |
| API 500 | 详情页 → `error.tsx` error boundary（含 Retry）；列表页 → Error 态 + Retry | ✅ |
| Supabase 权限错误 | 详情页 `getPublicJobBySlug` 抛错 → error boundary；列表页 → Error 态 | ✅（需 RLS 已正确配置） |
| 急招 0 条 | UrgentJobsSection Empty 态 | ✅ |
| 精选 0 条 | FeaturedJobsSection Empty 态 | ✅ |
| 赛道 0 岗位 | 赛道详情页岗位列表 Empty | ✅ |
| track=null | 详情正常；相关岗位 `[]`；不命中 track 筛选；首页聚合归「未分类」 | ✅ |
| 无 salary | `salary_display` 为空 → 前端隐藏薪资块（条件渲染） | ✅ |
| 无 direction | `direction` 为空 → 前端隐藏方向块 | ✅ |
| 无 requirements | `requirements` 由 mapper 保证 `[]`，前端 `map` 空数组 | ✅（依赖 mapper null 安全） |
| 重复投递 | RPC 24h 去重 → 409 → 前端提示 | 🟡（无唯一索引，理论竞态） |
| 网络断开 | fetch 抛错 → Error 态 / 提交失败提示 | ✅ |
| RPC 失败 | apply → 503；events → 静默 `success:true` | ✅ |
| Job Detail Server Render Error | `error.tsx`（error boundary + Retry） | ✅ |
| Mobile | 详情页底部固定投递/咨询栏；移动导航 Sheet | ✅ |

> 已知次要缺陷：`GET /api/public/jobs/[slug]`（未使用路由）对**任何** Supabase 错误都返回 404，会把真实 DB 错误误报为「不存在」；但该路由未被页面调用，实际影响有限（技术债 T8）。

## 12. 页面 / 代码地图（含调用关系）

| 页面/模块 | Route | Component | Hook / Data Layer | API | Supabase 表 / RPC |
|-----------|-------|-----------|-------------------|-----|-------------------|
| Homepage | `/` | `src/app/page.tsx` + `sections/*`（Hero/WhyQuantum/JobFastLane/Partners/Join） | `usePublicJobs`（各 Section 聚合）；静态 `data/*` | `GET /api/public/jobs`（各 Section） | `job_publications`（读） |
| Opportunities | `/opportunities` | `src/app/opportunities/page.tsx` + `job/job-filter.tsx` + `job/job-list.tsx` + `job/job-card.tsx` | `usePublicJobs()`（offset 分页） | `GET /api/public/jobs`、`GET /api/public/jobs/filter-options` | `job_publications`（读） |
| Job Detail | `/jobs/[slug]` | `src/app/jobs/[id]/page.tsx` + `apply-drawer.tsx` + `share-button.tsx` + `job-view-tracker.tsx` | `getPublicJobBySlug` / `getRelatedJobs`（Server） | 无（直查 Supabase） | `job_publications`（读） |
| Track List | `/tracks` | （redirect） | 无 | 无 | 无 |
| Track Detail | `/tracks/[id]` | `src/app/tracks/[id]/page.tsx` | Server self-fetch `/api/public/jobs?track=` | `GET /api/public/jobs` | `job_publications`（读） |
| Apply | `/jobs/[slug]`（抽屉） | `apply-drawer.tsx` | `useApply` | `POST /api/public/apply` | RPC `public_submit_application` → `leads` |
| Analytics | 全局 | `job-view-tracker.tsx` / navbar / cards | `trackEvent` → `trackApiEvent` | `POST /api/public/events` | RPC `public_track_event` → `analytics_events` |

**API Route 清单（共 5 个）**：

| Route | 方法 | 是否被页面使用 | 说明 |
|-------|------|----------------|------|
| `/api/public/jobs` | GET | ✅ | 列表（内联查询） |
| `/api/public/jobs/[slug]` | GET | ❌（页面用 `getPublicJobBySlug` 直查） | 冗余详情路由 |
| `/api/public/jobs/filter-options` | GET | ✅（仅用 `cities`，`tracks` 未用） | 城市/赛道选项 |
| `/api/public/apply` | POST | ✅ | 投递 |
| `/api/public/events` | POST | ✅ | 埋点 |

---

## 13. 当前项目技术架构

### 13.1 责任分界（真实）

| 层 | 职责 | 关键文件 |
|----|------|---------|
| **Server Component** | 详情页数据获取 + SSR 渲染 + SEO metadata | `src/app/jobs/[id]/page.tsx`、`src/app/tracks/[id]/page.tsx` |
| **Client Component** | 交互（筛选/分页/抽屉/导航/滚动动效） | `opportunities/page.tsx`、`navbar.tsx`、`apply-drawer.tsx` 等 |
| **API Route** | 公开读接口 + 受控写接口（apply/events） | `src/app/api/public/**` |
| **Server Data Layer** | `getPublicJobBySlug` / `getRelatedJobs` / mapper | `src/lib/public-jobs/server.ts`、`mapper.ts` |
| **Supabase Client** | `createBrowserClient`（客户端读）/ `createServerClient`（服务端读 + RPC） | `src/lib/supabase/client.ts`、`server.ts` |

### 13.2 README 过期点（已核实）

| 旧描述 | 当前真实实现 |
|--------|-------------|
| 「岗位详情（服务端 fetch）」 | 岗位详情为 Server Component **直查 Supabase**（`getPublicJobBySlug`），非 self-fetch |
| 「7 类事件」 | 当前 10 类事件 |
| 二级导航「急招/岗位中心/精选 → `/opportunities?...`」 | 当前均为**首页锚点** |
| 「通过 sessionStorage 保留搜索/筛选状态」 | `useFilterState` 为死代码，`/opportunities` 仅读 URL 参数，未接 sessionStorage |

---

## 14. 技术债（仅列真实存在）

| # | 问题 | 影响 | 严重度 | 涉及文件 | 影响主 UJ |
|---|------|------|--------|---------|-----------|
| T1 | **赛道详情页 self-fetch**（`http://localhost:${DEPLOY_RUN_PORT}`） | 部署后 localhost 可能不可达，赛道详情页岗位列表失效 | **P1** | `src/app/tracks/[id]/page.tsx` | 是（赛道 → 岗位路径） |
| T2 | **简历未采集**：ApplyDrawer 无 `resume_url` 上传，`resume_url` 恒 null | UJ「提交简历」降级为「提交联系方式」 | **P1** | `apply-drawer.tsx`、`use-apply.ts` | 是（投递闭环不完整） |
| T3 | **详情查询逻辑重复**：`getPublicJobBySlug` vs `/api/public/jobs/[slug]` | 维护成本 + 潜在 contract 漂移 | P2 | `lib/public-jobs/server.ts`、`app/api/public/jobs/[slug]/route.ts` | 否 |
| T4 | **重复 PublicJob DTO**：`public-job.ts` vs `supabase/types.ts`（旧） | 类型漂移风险 | P2 | `lib/public-job.ts`、`lib/supabase/types.ts` | 否 |
| T5 | **死代码**：`usePublicJob`、`useFilterState`、`use-filter-state.ts`、`supabase/types.ts` 未被使用 | 误导审计 / 增加认知负担 | P2 | `hooks/use-public-jobs.ts`、`hooks/use-filter-state.ts`、`lib/supabase/types.ts` | 否 |
| T6 | **`job_view` 埋点语义漂移**：导航点击复用 `job_view` | 分析数据失真（岗位浏览数虚高） | P2 | `navbar.tsx`、`analytics.ts` | 否 |
| T7 | **session id 双机制**（sessionStorage vs 内存变量） | 会话归因不一致 | P2 | `analytics.ts`、`analytics-api.ts` | 否 |
| T8 | **Lead 去重无唯一索引**（仅 RPC SELECT 判断） | 极端并发下可能重复 Lead | P2 | `docs/public-write-rpc.sql` | 否（低概率） |
| T9 | **`[slug]` 路由将 DB 错误误报为 404** | 排障误导（该路由未被页面用，影响有限） | P2 | `app/api/public/jobs/[slug]/route.ts` | 否 |
| T10 | **`filter-options` 的 `tracks` 字段未使用**（UI 用静态 `getActiveTracks`） | 冗余 | P3 | `app/api/public/jobs/filter-options/route.ts`、`opportunities/page.tsx` | 否 |
| T11 | **环境变量双 Supabase**：`NEXT_PUBLIC_SUPABASE_*`（代码用）vs `COZE_SUPABASE_*`（平台原生，代码不用） | 易混淆 | P2 | 环境配置（非代码） | 否 |
| T12 | **a11y 告警**：`DialogContent` 缺 `Description`/`aria-describedby` | 无障碍合规 | P3 | `apply-drawer.tsx` / Sheet 使用处 | 否 |
| T13 | **文档失真**：AGENTS.md 导航表 / `job_share` / README 事件数 / sessionStorage 描述 | 误导 Codex 审计 | P2 | `AGENTS.md`、`README.md` | 否 |

---

## 15. UJ 状态矩阵与最终结论

| 节点 | 状态 | 依据 |
|------|------|------|
| 候选人进入网站 | ✅ | `GET /` 200，静态渲染 |
| 浏览岗位 | ✅ | `GET /api/public/jobs` 200 + 真实岗位数据（日志验证） |
| 筛选岗位 | ✅ | search/track/city/urgent/featured 参数均生效 |
| 查看详情 | ✅ | `GET /jobs/…` 200 + `notFound` 404（日志验证） |
| 提交投递 | 🟡 | 代码链路完整，但**简历未采集**（仅联系方式） |
| Lead 落库 | 🟡 | 依赖 `public_submit_application` RPC 迁移已执行；日志未见 apply 请求，无法从日志直接验证落库 |

### 最终结论：**YES BUT**

**依据**：

- **岗位「发现 → 详情」链路确认为 YES**：运行时日志证明列表 / 详情 / 筛选 / 404 全部正常返回，且 Supabase anon 读权限已生效（返回真实岗位数据）。
- **「投递 → Lead」链路为 BUT**，存在两个前置/缺口：
  1. **简历未采集**：`resume_url` 恒 null，UJ 中「提交简历」实际退化为「提交联系方式（姓名/手机/邮箱/备注）」。
  2. **RPC 落库依赖部署前提**：`public_submit_application` 需 `docs/public-write-rpc.sql` 已在 Supabase SQL Editor 执行；代码层正确，但 Showcase 侧无法从代码确认落库是否成功（运行时日志未见 apply 请求）。

> 结论：一个真实候选人**可以稳定完成「发现岗位 → 查看详情 → 提交联系方式 → 形成 Lead」**（在 RPC 迁移已部署前提下），但**无法完成「提交简历文件」**这一 UJ 原意步骤。

---

## 16. Codex 后续重点审计清单

1. **T1（P1）**：确认赛道详情页 self-fetch 在部署环境的可用性；建议改为 Server Component 直查（对齐岗位详情实现）。
2. **T2（P1）**：确认「简历上传」是否为 Showcase 必需能力；若需，补齐 `resume_url` 上传 + 存储（当前 UJ 缺口）。
3. **投递闭环验证**：在 Supabase 侧确认 `public_submit_application` / `public_track_event` RPC 与 RLS 已实际执行；实测一次 apply 请求并核对 `leads` 落库。
4. **T3/T4/T5（P2）**：清理重复详情查询逻辑、旧 `PublicJob` DTO、死代码（`usePublicJob` / `useFilterState`），避免审计误判。
5. **T8（P2）**：评估 `leads` 表是否需要唯一约束索引以消除 TOCTOU 重复风险。
6. **T6/T7（P2）**：收敛 `job_view` 埋点语义与 session id 机制，保证分析数据可信。
7. **T13（P2）**：修正 `AGENTS.md` / `README.md` 中的导航表、事件白名单（`share` vs `job_share`）、事件数、sessionStorage 描述，消除文档失真。
8. **隐私复核**：确认公开读白名单（`PUBLIC_JOB_FIELDS`）与 RLS 策略一致，无内部字段（company/owner/notes/priority）泄漏。




