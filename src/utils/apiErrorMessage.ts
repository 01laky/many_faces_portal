import type { AxiosError } from 'axios';

/**
 * Parse API error payloads into a short user-facing string.
 * Supports: { error }, ASP.NET ProblemDetails { title, detail }, Identity-style { errors: {} }.
 */
export function parseApiErrorBody(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  try {
    const j = JSON.parse(trimmed) as Record<string, unknown>;

    if (typeof j.error === 'string' && j.error.trim()) {
      return j.error.trim();
    }

    const detail = typeof j.detail === 'string' ? j.detail.trim() : '';
    const title = typeof j.title === 'string' ? j.title.trim() : '';
    if (detail) return detail;
    if (title) return title;

    const errors = j.errors;
    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      const parts: string[] = [];
      for (const v of Object.values(errors as Record<string, unknown>)) {
        if (Array.isArray(v)) {
          for (const x of v) {
            if (typeof x === 'string' && x.trim()) parts.push(x.trim());
          }
        }
      }
      if (parts.length > 0) return parts.join(' ');
    }

    return fallback;
  } catch {
    if (trimmed.length <= 280) return trimmed;
    return fallback;
  }
}

/** Maps axios failures (profile API, etc.) to a short user-facing message. */
export function getAxiosApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const ax = error as AxiosError<{
    error?: string;
    title?: string;
    detail?: string;
    errors?: unknown;
  }>;
  const data = ax.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return parseApiErrorBody(data, fallback);
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === 'string' && obj.error.trim()) return obj.error.trim();
    const detail = typeof obj.detail === 'string' ? obj.detail.trim() : '';
    const title = typeof obj.title === 'string' ? obj.title.trim() : '';
    if (detail) return detail;
    if (title) return title;
    return parseApiErrorBody(JSON.stringify(obj), fallback);
  }
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return fallback;
}

/** Read response body and parse; use when !res.ok (consumes body). */
export async function getApiErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const raw = await res.text();
    return parseApiErrorBody(raw, fallback);
  } catch {
    return fallback;
  }
}
