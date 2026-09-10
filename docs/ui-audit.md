# UI 审计报告

## 1. 当前页面与路由

| 路由 | 页面 | 状态 |
|------|------|------|
| `/` | 首页 | 已有，需重构 |
| `/opportunities` | 岗位中心 | 已有，需重构 |
| `/jobs/[id]` | 岗位详情 | 已有，需重构 |
| `/tracks` | 赛道总览 | **缺失** |
| `/tracks/superconducting` | 超导量子详情 | **缺失** |
| `/tracks/ion-trap` | 离子阱详情 | **缺失** |
| `/tracks/photonics` | 光量子详情 | **缺失** |
| `/tracks/communication-sensing` | 量子通信与测量详情 | **缺失** |

## 2. 当前已实现功能

- 首页单页滚动叙事（Hero / WhyQuantum / Tracks / FeaturedJobs / Partners / Join / Footer）
- 岗位中心搜索与筛选（关键词、赛道、城市、急招）
- 岗位详情页（职责、要求、投递/咨询 Drawer、分享、浏览埋点）
- 返回列表时通过 sessionStorage 保留筛选状态
- 移动端响应式适配
- 液态玻璃导航栏
- ScrollReveal 滚动渐入动画
- 邮箱复制、微信二维码展示
- 事件埋点空实现

## 3. 四大赛道缺失情况

### 3.1 赛道数据存在但无独立页面

当前 `tracks.ts` 中有四大赛道数据，但：
- 赛道卡片仅链接到 `/opportunities?track=xxx`
- **没有任何赛道独立页面**
- 赛道数据缺少详情页所需字段（概述正文、核心技术路线、典型应用、人才类型等）

### 3.2 Track ID 不匹配

| 当前 ID | 要求 ID |
|---------|---------|
| `photonic` | `photonics` |
| `communication` | `communication-sensing` |

需修正 ID 以匹配路由 `/tracks/photonics` 和 `/tracks/communication-sensing`。

## 4. 当前 UI 中存在的 AI 模板化问题

| # | 问题 | 位置 |
|---|------|------|
| 1 | Hero 居中布局，标题+副标题+按钮全部居中 | hero-section.tsx |
| 2 | WhyQuantum 使用三张完全相同的图标功能卡 | why-quantum-section.tsx |
| 3 | Tracks 使用 2x2 对称网格 | tracks-section.tsx |
| 4 | FeaturedJobs 使用 3 列卡片网格 | featured-jobs-section.tsx |
| 5 | Partners 使用 3 列 Logo 网格 | partners-section.tsx |
| 6 | Join 居中液态玻璃面板 | join-section.tsx |
| 7 | 所有 Section 使用相同的居中标题+副标题结构 | 全站 |
| 8 | 岗位列表使用卡片墙而非编辑式列表 | job-list.tsx |
| 9 | 赛道无独立页面，仅作为筛选入口 | tracks-section.tsx |
| 10 | Hero 缺少英文副标题和垂直滚动指示器 | hero-section.tsx |

## 5. 可保留的内容和功能

### 数据层（全部保留，需扩展）
- `site-config.ts` — 站点配置、联系方式、SEO 信息
- `tracks.ts` — 四大赛道基础数据（需修正 ID + 扩展字段）
- `jobs.ts` — 10 个岗位数据（需同步 trackId 变更）
- `partners.ts` — 6 个合作机构数据
- `index.ts` — 数据查询函数

### 组件层（保留逻辑，重构视觉）
- `ScrollReveal` — 滚动渐入动画，保留
- `LiquidGlass` — 液态玻璃组件，保留
- `ApplyDrawer` — 投递/咨询面板，保留逻辑
- `ShareButton` — 分享功能，保留逻辑
- `JobViewTracker` — 浏览埋点，保留
- `use-filter-state.ts` — 筛选状态 Hook，保留逻辑

### 功能逻辑（全部保留）
- 搜索与筛选逻辑
- sessionStorage 筛选状态保留
- 邮箱复制 / 微信咨询 / 分享链接
- 事件埋点
- SEO metadata

## 6. 必须重构的页面

| 优先级 | 页面 | 重构原因 |
|--------|------|----------|
| P0 | 首页 Hero | 居中布局 → 左偏置布局，需匹配用户选定设计稿 |
| P0 | 首页 WhyQuantum | 三卡 → 编辑式非对称布局 |
| P0 | 首页 Tracks | 2x2网格 → 编号式纵向交错条带 |
| P0 | 首页 FeaturedJobs | 卡片墙 → 杂志目录式列表 |
| P0 | 首页 Partners | Logo网格 → 编辑式文字列表 |
| P0 | 首页 Join | 居中面板 → 左右分栏液态玻璃 |
| P0 | 导航 Navbar | 增加"赛道"导航项，链接到 /tracks |
| P0 | Footer | 增加赛道链接 |
| P1 | 赛道总览 `/tracks` | 新建 |
| P1 | 四个赛道详情页 `/tracks/[id]` | 新建 |
| P2 | 岗位中心 `/opportunities` | 岗位列表重构为杂志目录式 |
| P2 | 岗位详情 `/jobs/[id]` | 重构为左右分栏布局 |

## 7. 本轮整改清单

### 数据层
- [x] 修正 track ID：`photonic` → `photonics`，`communication` → `communication-sensing`
- [x] 扩展 Track 类型：增加 `overview`、`techRoutes`、`applications`、`talentTypes`、`heroGradient` 字段
- [x] 同步 jobs.ts 中的 trackId
- [x] 扩展 site-config.ts：增加 heroEnglishTagline、heroDescription 字段

### 路由层
- [x] 新建 `/tracks` 赛道总览页
- [x] 新建 `/tracks/[id]` 赛道详情页（动态路由，支持四个赛道）

### 组件层
- [x] 重构 HeroSection（匹配用户选定设计稿）
- [x] 重构 WhyQuantumSection（编辑式非对称布局）
- [x] 重构 TracksSection（编号式纵向交错条带，链接到独立页面）
- [x] 重构 FeaturedJobsSection（杂志目录式列表）
- [x] 重构 PartnersSection（编辑式文字列表）
- [x] 重构 JoinSection（左右分栏液态玻璃）
- [x] 重构 Navbar（增加赛道导航）
- [x] 重构 Footer（增加赛道链接）
- [x] 新建赛道详情页组件

### 样式层
- [x] 更新 globals.css 设计 Token
- [x] 更新液态玻璃样式
- [x] 确保 prefers-reduced-motion 支持
