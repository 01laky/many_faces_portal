/**
 * Minimal first-paint shell shown in index.html before React mounts.
 * Replaced when bootstrap succeeds; reused for localization fetch errors with retry.
 */

export function renderBootstrapLoading(root: HTMLElement): void {
  root.innerHTML =
    '<div style="display:flex;min-height:100vh;align-items:center;justify-content:center;font-family:system-ui,sans-serif;color:#444">' +
    '<p>Loading translations…</p></div>';
}

export function renderBootstrapError(root: HTMLElement, apiUrl: string, onRetry: () => void): void {
  root.innerHTML =
    '<div style="padding:2rem;font-family:system-ui,sans-serif;max-width:32rem">' +
    '<h1 style="margin-top:0">Could not load translations</h1>' +
    '<p>Check that the API is running and reachable at <code style="background:#f4f4f4;padding:0.15rem 0.35rem">' +
    escapeHtml(apiUrl) +
    '</code>, then retry.</p>' +
    '<p style="color:#666;font-size:0.9rem">Endpoint: <code>GET /api/localization/portal</code> (face-prefix exempt).</p>' +
    '<button type="button" id="i18n-retry" style="margin-top:1rem;padding:0.5rem 1rem;cursor:pointer">Retry</button>' +
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
