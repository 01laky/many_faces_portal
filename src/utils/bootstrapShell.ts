/**
 * Minimal first-paint shell shown in index.html before React mounts.
 * Replaced when bootstrap succeeds; reused for localization fetch errors with retry.
 */

import { buildVanillaPreloaderHtml } from './globalPreloaderVanillaShell';

export function renderBootstrapLoading(root: HTMLElement): void {
  root.innerHTML = buildVanillaPreloaderHtml();
}

export function renderBootstrapError(root: HTMLElement, apiUrl: string, onRetry: () => void): void {
  root.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;padding:2rem;font-family:system-ui,sans-serif;text-align:center">' +
    '<img src="/favicon-32x32.png" width="68" height="68" alt="" style="margin-bottom:1rem">' +
    '<h1 style="margin:0 0 0.5rem;font-size:1.125rem;color:#0f172a">Could not load translations</h1>' +
    '<p style="margin:0 0 0.5rem;color:#64748b;font-size:0.875rem;max-width:28rem">Check that the API is running and reachable at <code style="background:#f1f5f9;padding:0.15rem 0.35rem">' +
    escapeHtml(apiUrl) +
    '</code>, then retry.</p>' +
    '<p style="color:#94a3b8;font-size:0.8rem">Endpoint: <code>GET /api/localization/portal</code> (face-prefix exempt).</p>' +
    '<button type="button" id="i18n-retry" style="margin-top:1rem;padding:0.5rem 1rem;cursor:pointer;border:1px solid #cbd5e1;border-radius:0.375rem;background:#fff">Retry</button>' +
    '</div>';
  root.querySelector('#i18n-retry')?.addEventListener('click', () => onRetry());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
