# Portal security hardening (PSH1)

Security controls implemented in `many_faces_portal` as part of engagement **PSH1** (see monorepo `docs/prompts/security-hardening-portal-v1-agent-prompt.md`).

## Auth & session

- **401 refresh single-flight** — `src/api/interceptors.ts` queues parallel 401s behind one OAuth refresh; terminal failure clears storage and dispatches `auth:unauthorized`.
- **No open redirect** — `src/utils/safeRedirect.ts` allow-lists post-login paths (`LoginPage`, `ProtectedRoute` state).
- **Multi-tab sync** — `src/utils/authSessionSync.ts` listens for `storage` events when another tab clears tokens.
- **Portal 403 policy** — face-scoped ACL denials do **not** wipe the session (`interceptorPolicy.shouldForceLogoutOn403` returns false).

## Face routing

- Axios request interceptor prepends `/{face}/` before `/api/` and `/hubs/` (exempt: oauth, auth, localization, profile, my/).
- `invalidateMemoizedFacePrefixCache()` on face switch prevents stale prefix races.

## SignalR

- Hubs use `AccessTokenProvider` (`resolveHubAccessToken`) for negotiate/reconnect.
- Start policies in `src/api/signalr/hubStartPolicy.ts` gate messenger, chat room, and AI chat connections.

## XSS & media URLs

- Blog HTML sanitized with DOMPurify on save and render (`blogHtmlSecurity.ts`).
- Media URLs must be HTTPS CDN or backend-signed `uploads/serve` links (`safeUrl.ts`).

## Environment

- Production builds require HTTPS `VITE_API_URL` and reject the demo OAuth client secret.
- Mixed-content guard in `configureApiClient` when the page is served over HTTPS.

## Transport & CSP (Phase E)

The production image serves the built SPA through nginx (`nginx.conf`). The static host sets the
following response headers (Vite dev server + the LAN dev proxy on `9080/9081` are separate and not
covered here):

| Header                    | Value                                                                                                                                                                                                                                               | Item        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'` | **PSH1-E1** |
| `X-Frame-Options`         | `SAMEORIGIN` (+ CSP `frame-ancestors 'self'`)                                                                                                                                                                                                       | **PSH1-E2** |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`                                                                                                                                                                                                                   | **PSH1-E2** |
| `X-Content-Type-Options`  | `nosniff`                                                                                                                                                                                                                                           | —           |

**Why this exact CSP:**

- `script-src 'self'` — the built bundle is a single external ES module (`dist/index.html` has no
  inline `<script>`), so no `'unsafe-inline'`/hash is needed for scripts.
- `style-src 'self' 'unsafe-inline'` — `index.html` ships the inline preloader `<style>` and
  `@font-face`, and React/runtime libraries inject `style=` attributes. This is the one relaxation.
- `connect-src 'self' https: wss:` — REST API (env-configured origin) plus SignalR websockets.
  Deployments that pin a single API origin should narrow this to that host.
- `img-src 'self' data: blob: https:` — favicons/logo, backend-signed media, and HTTPS CDN images.

**CSP as a compensating control (DOC-4):** the portal stores its OAuth tokens in `localStorage`
(`src/utils/authStorage.ts`), which is readable by any script that executes in the page. The strict
`script-src 'self'` (no inline scripts, no third-party origins) is the compensating control that
makes token theft via injected `<script>` substantially harder; blog HTML is additionally sanitized
with DOMPurify (see [XSS & media URLs](#xss--media-urls)).

**HTTPS dev (PSH1-E3):** local HTTPS cert alignment with the backend CORS allow-list is documented in
[`docs/guides/dev-https.md`](../../docs/guides/dev-https.md). Production behind TLS should additionally
send `Strict-Transport-Security` and may add `upgrade-insecure-requests` to the CSP (omitted from the
container config so a plain-HTTP LAN demo is not broken).

**TRACK-PSH1-BFF:** tokens remain in `localStorage` rather than `HttpOnly` cookies via a
backend-for-frontend. Moving to a cookie/BFF session is tracked as a follow-up and is out of scope for
PSH1; the CSP above is the interim mitigation.

## Tests

Run the PSH1 regression suite:

```bash
yarn test:security
# or from monorepo root:
node scripts/verify-portal-security-tests.mjs
```

All cases are named `PSH1-T-*` in `src/**/*.security.test.ts`.
