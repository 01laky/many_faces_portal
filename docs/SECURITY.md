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

## Tests

Run the PSH1 regression suite:

```bash
yarn test:security
# or from monorepo root:
node scripts/verify-portal-security-tests.mjs
```

All cases are named `PSH1-T-*` in `src/**/*.security.test.ts`.
