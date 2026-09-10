'use client';

import { useState } from 'react';

interface ApplyData {
  full_name: string;
  phone: string;
  email: string;
  publication_id: string;
  notes?: string;
  resume_url?: string;
  source?: string;
}

interface ApplyResult {
  success: boolean;
  message: string;
  lead_id?: string;
  code?: string;
}

export function useApply() {
  const [submitting, setSubmitting] = useState(false);

  async function apply(data: ApplyData): Promise<ApplyResult> {
    setSubmitting(true);
    try {
      const res = await fetch('/api/public/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        return {
          success: true,
          message: result.data?.message || '投递成功！我们会尽快与您联系。',
          lead_id: result.data?.lead_id,
        };
      }

      // Error response: { success: false, error: { code, message } }
      return {
        success: false,
        message: result.error?.message || result.message || '投递失败，请稍后重试',
        code: result.error?.code,
      };
    } catch {
      return { success: false, message: '网络错误，请稍后重试' };
    } finally {
      setSubmitting(false);
    }
  }

  return { apply, submitting };
}
