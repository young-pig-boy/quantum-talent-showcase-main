# SUPABASE_REQUIRED_CHANGES.md

## 展示站 × Supabase 数据库方整改需求

**生成日期**：2026-08-05
**Project Ref**：`wbpnvbvdotkjhwxhndhz`
**约束**：本文档仅记录数据库侧需要配合的修改，本轮不执行SQL。

---

## 1. P0：job_publications 表 anon SELECT 权限

### 问题

当前 `anon` 角色对 `job_publications` 表无任何 PostgREST 读取权限。已验证：
- `supabase.from('job_publications').select('id, status, slug').limit(1).eq('status', 'published')` 返回 0 行，无错误
- 即使 `select('*')` 也无数据返回
- 同一连接的 RPC 调用（`public_submit_application`、`public_track_event`）正常，说明连接本身可用

### 当前数据库事实

- `job_publications` 表存在 RLS 且已启用
- RLS Policy 可能配置为：仅 `authenticated` 或特定角色可读
- `anon` 被完全拒绝

### 影响

- 展示站首页：岗位列表为空
- 赛道详情页：相关岗位列表为空
- 岗位中心 `/opportunities`：岗位列表为空
- 岗位详情 `/jobs/[slug]`：404

展示站所有公开岗位读取功能完全不可用。

### 最小建议修改

为 `job_publications` 表添加一个允许 `anon` 读取 `status = 'published'` 行的 RLS Policy：

```sql
-- 允许匿名用户读取已发布的岗位公告
CREATE POLICY "anon_can_read_published_publications"
  ON job_publications
  FOR SELECT
  TO anon
  USING (status = 'published');
```

### 为什么需要修改

展示站的公开岗位 API 已重构为**仅查询 `job_publications` 表**（不再 JOIN `jobs`、`companies`），所有公开展示所需字段均应从该表获取。`anon` 必须有 SELECT 权限才能让公开展示正常工作。

### 涉及对象

| 对象 | 类型 | 操作 |
|------|------|------|
| `job_publications` | Table | GRANT SELECT TO anon (via RLS Policy) |

### 不修改会怎样

展示站所有岗位相关页面持续返回空数据，公开岗位展示功能不可用。

---

## 2. P1：job_publications 必要字段确认

### 问题

展示站 API 重构后，从 `job_publications` 读取以下字段构造公开响应。如果表中缺少某字段，对应位置会显示空值。

### 当前依赖字段

```
id, slug, status, track, city, education, experience,
requirements, responsibilities, salary_display, tags, urgent, published_at
```

### 额外需要的字段（如果不存在，需从 jobs 表迁移）

| 字段 | 作用 | 当前备用方案 |
|------|------|-------------|
| `public_title` | 岗位公开展示标题 | 已 fallback 到 `title` |
| `public_company_name` | 公司公开展示名称 | 已 fallback 到 `company_name` → `company` |

### 最小建议修改

如果 `job_publications` 表尚未包含 `public_title` 和 `public_company_name` 列，请在创建 Publication 时同步写入这些字段（从关联的 `jobs`、`companies` 表取值）。参考 RPC `public_submit_application` 中已有类似逻辑。

### 涉及对象

| 对象 | 类型 | 操作 |
|------|------|------|
| `job_publications` | Table | ADD COLUMN `public_title` TEXT, `public_company_name` TEXT（如不存在） |
| Publication 创建逻辑 | Trigger/Function | 同步写入 `public_title`、`public_company_name` |

---

## 3. P1：analytics_events.event_type CHECK 对齐

### 问题

无法从展示站代码侧验证 `analytics_events.event_type` 的 DB CHECK constraint 是否与 RPC 白名单完全一致。

### 当前 RPC `public_track_event` 白名单

```
job_impression, job_view, contact_click, apply_start, apply_submit, email_copy, wechat_consult
```

### 建议

确认 `analytics_events` 表的 `event_type` CHECK constraint 包含以上全部 7 个值，避免 RPC 通过但 DB 写入被拒绝。

---

## 4. Remaining Risk：数据库级幂等性

### 问题

`public_submit_application` RPC 已有 24 小时内同 `publication_id` + 同 `phone`/`email` 去重。但未确认数据库侧是否有唯一约束（Partial Unique Index）。

### 建议

如需更强的幂等保证，建议添加：

```sql
CREATE UNIQUE INDEX idx_leads_dedup_24h
  ON leads (publication_id, phone)
  WHERE created_at > NOW() - INTERVAL '24 hours';
```

同样对 `email` 添加对应索引。

---

## 变更摘要

| 优先级 | 类别 | 涉及对象 | 操作 |
|--------|------|----------|------|
| **P0** | RLS | `job_publications` | 添加 anon SELECT Policy（仅 published） |
| P1 | Schema | `job_publications` | 确认/添加 `public_title`, `public_company_name` 列 |
| P1 | Schema | `analytics_events` | 确认 event_type CHECK 与 RPC 一致 |
| Risk | Index | `leads` | 考虑添加幂等索引 |
