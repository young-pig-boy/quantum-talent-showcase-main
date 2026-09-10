-- =============================================
-- 安全公开写入 RPC — 展示网站投递 + 埋点
-- =============================================
-- 说明：
--   通过受控 RPC 函数替代直接匿名 INSERT，
--   在不暴露 Secret Key、不开放 leads/analytics_events 任意写入的前提下，
--   打通"展示网站投递 → Lead → 控制台"与 Analytics 写入闭环。
--
-- 执行方式：
--   在 Supabase Dashboard → SQL Editor 中执行本文件全部语句。
--   本文件可安全重复执行（CREATE OR REPLACE）。
--
-- 安全原则：
--   - leads / analytics_events 不开放匿名直接 INSERT
--   - 所有写入通过 SECURITY DEFINER 函数，内部严格校验
--   - 客户端不可指定 status / owner_id / converted_talent_id 等内部字段
--   - site_id 从 publication 自动推导
-- =============================================

-- =============================================
-- 一、投递 RPC: public_submit_application
-- =============================================

CREATE OR REPLACE FUNCTION public_submit_application(
  p_publication_id uuid,
  p_full_name text,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_source text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_resume_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_pub record;
  v_lead_id uuid;
  v_existing uuid;
BEGIN
  -- 1. 校验 publication_id 必填
  IF p_publication_id IS NULL THEN
    RAISE EXCEPTION 'PUBLICATION_REQUIRED: 岗位信息缺失';
  END IF;

  -- 2. 校验 Publication 存在且为 published
  SELECT id, status, site_id
    INTO v_pub
    FROM job_publications
   WHERE id = p_publication_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PUBLICATION_NOT_FOUND: 该岗位不存在';
  END IF;

  IF v_pub.status IS NULL OR v_pub.status != 'published' THEN
    RAISE EXCEPTION 'PUBLICATION_NOT_AVAILABLE: 该岗位已关闭或不可投递';
  END IF;

  -- 3. 校验 full_name 必填
  IF p_full_name IS NULL OR trim(p_full_name) = '' THEN
    RAISE EXCEPTION 'NAME_REQUIRED: 姓名不能为空';
  END IF;

  -- 4. phone 与 email 至少有一个
  IF (p_phone IS NULL OR trim(p_phone) = '')
     AND (p_email IS NULL OR trim(p_email) = '') THEN
    RAISE EXCEPTION 'CONTACT_REQUIRED: 手机号和邮箱至少填写一项';
  END IF;

  -- 5. 长度限制
  IF length(trim(p_full_name)) > 100 THEN
    RAISE EXCEPTION 'NAME_TOO_LONG: 姓名不能超过100个字符';
  END IF;

  IF p_phone IS NOT NULL AND length(trim(p_phone)) > 30 THEN
    RAISE EXCEPTION 'PHONE_TOO_LONG: 手机号不能超过30个字符';
  END IF;

  IF p_email IS NOT NULL AND length(trim(p_email)) > 200 THEN
    RAISE EXCEPTION 'EMAIL_TOO_LONG: 邮箱不能超过200个字符';
  END IF;

  IF p_notes IS NOT NULL AND length(p_notes) > 2000 THEN
    RAISE EXCEPTION 'NOTES_TOO_LONG: 备注不能超过2000个字符';
  END IF;

  IF p_resume_url IS NOT NULL AND length(p_resume_url) > 1000 THEN
    RAISE EXCEPTION 'RESUME_URL_TOO_LONG: 简历链接过长';
  END IF;

  IF p_source IS NOT NULL AND length(trim(p_source)) > 100 THEN
    RAISE EXCEPTION 'SOURCE_TOO_LONG: 来源信息过长';
  END IF;

  -- 6. 重复投递检查：同一 publication + 相同 phone 或 email，24 小时内不重复创建
  IF p_phone IS NOT NULL AND trim(p_phone) != '' THEN
    SELECT id INTO v_existing
      FROM leads
     WHERE publication_id = p_publication_id
       AND phone = trim(p_phone)
       AND created_at > (now() - interval '24 hours')
     LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'code', 'DUPLICATE_SUBMISSION',
        'message', '该岗位已收到你的申请，请勿重复提交。'
      );
    END IF;
  END IF;

  IF p_email IS NOT NULL AND trim(p_email) != '' THEN
    SELECT id INTO v_existing
      FROM leads
     WHERE publication_id = p_publication_id
       AND email = trim(p_email)
       AND created_at > (now() - interval '24 hours')
     LIMIT 1;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'code', 'DUPLICATE_SUBMISSION',
        'message', '该岗位已收到你的申请，请勿重复提交。'
      );
    END IF;
  END IF;

  -- 7. 插入 Lead（status 强制为 'new'，不允许客户端指定）
  INSERT INTO leads (
    full_name,
    phone,
    email,
    publication_id,
    site_id,
    source_channel,
    notes,
    resume_url,
    status,
    created_at,
    updated_at
  ) VALUES (
    trim(p_full_name),
    CASE WHEN p_phone IS NOT NULL AND trim(p_phone) != '' THEN trim(p_phone) ELSE NULL END,
    CASE WHEN p_email IS NOT NULL AND trim(p_email) != '' THEN trim(p_email) ELSE NULL END,
    p_publication_id,
    v_pub.site_id,
    CASE WHEN p_source IS NOT NULL AND trim(p_source) != '' THEN trim(p_source) ELSE NULL END,
    CASE WHEN p_notes IS NOT NULL AND trim(p_notes) != '' THEN p_notes ELSE NULL END,
    CASE WHEN p_resume_url IS NOT NULL AND trim(p_resume_url) != '' THEN p_resume_url ELSE NULL END,
    'new',
    now(),
    now()
  ) RETURNING id INTO v_lead_id;

  -- 8. 返回安全结果（不暴露内部字段）
  RETURN jsonb_build_object(
    'success', true,
    'lead_id', v_lead_id
  );
END;
$$;

-- 权限设置
REVOKE ALL ON FUNCTION public_submit_application(uuid, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public_submit_application(uuid, text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public_submit_application(uuid, text, text, text, text, text, text) TO authenticated;


-- =============================================
-- 二、埋点 RPC: public_track_event
-- =============================================

CREATE OR REPLACE FUNCTION public_track_event(
  p_event_type text,
  p_publication_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_id uuid;
  v_safe_metadata jsonb := COALESCE(p_metadata, '{}'::jsonb);
  v_allowed_types text[] := ARRAY[
    'page_view',
    'track_click',
    'job_impression',
    'job_view',
    'share',
    'contact_click',
    'apply_start',
    'apply_submit',
    'email_copy',
    'wechat_consult'
  ];
BEGIN
  -- 1. 校验 event_type 必填
  IF p_event_type IS NULL OR trim(p_event_type) = '' THEN
    RAISE EXCEPTION 'EVENT_TYPE_REQUIRED: event_type 不能为空';
  END IF;

  -- 2. 校验 event_type 在白名单内
  IF NOT (trim(p_event_type) = ANY(v_allowed_types)) THEN
    RAISE EXCEPTION 'INVALID_EVENT_TYPE: %', p_event_type;
  END IF;

  -- 3. 如果提供 publication_id，验证其存在并推导 site_id
  IF p_publication_id IS NOT NULL THEN
    SELECT site_id INTO v_site_id
      FROM job_publications
     WHERE id = p_publication_id;
    IF NOT FOUND THEN
      v_site_id := NULL;
    END IF;
  END IF;

  -- 4. 长度限制
  IF p_session_id IS NOT NULL AND length(p_session_id) > 200 THEN
    RAISE EXCEPTION 'SESSION_ID_TOO_LONG: session_id 过长';
  END IF;

  IF p_referrer IS NOT NULL AND length(p_referrer) > 1000 THEN
    RAISE EXCEPTION 'REFERRER_TOO_LONG: referrer 过长';
  END IF;

  -- 5. metadata 大小限制（约 10KB）
  IF octet_length(v_safe_metadata::text) > 10240 THEN
    RAISE EXCEPTION 'METADATA_TOO_LARGE: metadata 数据过大';
  END IF;

  -- 6. 插入事件（occurred_at 使用数据库时间）
  INSERT INTO analytics_events (
    event_type,
    publication_id,
    site_id,
    session_id,
    referrer,
    metadata,
    occurred_at
  ) VALUES (
    trim(p_event_type),
    p_publication_id,
    v_site_id,
    CASE WHEN p_session_id IS NOT NULL AND trim(p_session_id) != '' THEN trim(p_session_id) ELSE NULL END,
    CASE WHEN p_referrer IS NOT NULL AND trim(p_referrer) != '' THEN p_referrer ELSE NULL END,
    v_safe_metadata,
    now()
  );

  RETURN jsonb_build_object('success', true, 'message', 'ok');
END;
$$;

-- 权限设置
REVOKE ALL ON FUNCTION public_track_event(text, uuid, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public_track_event(text, uuid, text, text, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public_track_event(text, uuid, text, text, jsonb) TO authenticated;


-- =============================================
-- 三、清理旧的宽松 RLS 策略（如存在）
-- =============================================

-- 如果之前执行过允许匿名任意 INSERT 的策略，请手动删除：
-- DROP POLICY IF EXISTS "leads_公开写入" ON leads;
-- DROP POLICY IF EXISTS "analytics_events_公开写入" ON analytics_events;
--
-- 注意：不要删除控制台项目自身需要的 RLS 策略。


-- =============================================
-- 四、验证查询（执行后运行以确认）
-- =============================================

-- 确认函数已创建：
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name IN ('public_submit_application', 'public_track_event');

-- 确认权限：
-- SELECT has_function_privilege('anon', 'public_submit_application(uuid,text,text,text,text,text,text)', 'execute');
-- SELECT has_function_privilege('anon', 'public_track_event(text,uuid,text,text,jsonb)', 'execute');
