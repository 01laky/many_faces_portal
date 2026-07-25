# Changelog

All notable changes to **`many_faces_portal`** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — **version headings only, no dates**. SemVer: [`VERSION`](./VERSION).

### Release index

| Version       | Theme                                            |
| ------------- | ------------------------------------------------ |
| [1.2.0](#120) | GPL-19 test, preloader docs, grid form i18n      |
| [1.1.5](#115) | Fix the no-op TypeScript gate                    |
| [1.1.4](#114) | REF-F / REF-X test families + display-prefs link |
| [1.1.3](#113) | Clear high-severity dependency advisories        |
| [1.1.2](#112) | API image URLs through HTTPS allow-list          |
| [1.1.1](#111) | Reel media URLs through HTTPS allow-list         |
| [1.1.0](#110) | CSP + Referrer-Policy baseline on nginx host     |
| [1.0.5](#105) | Fix face page grid losing its responsive layout  |
| [1.0.4](#104) | Fix post-login faces reload using a stale token  |
| [1.0.3](#103) | Untested-utility edge tests (test-gap fill)      |
| [1.0.2](#102) | Gradient-animation preference edge tests         |
| [1.0.1](#101) | Review pass: cache leak, profile, redaction      |
| [1.0.0](#100) | Portal runtime performance v1 (PT-RP1–30)        |
| [0.9.3](#093) | Contexts colocation + hooks/api re-folder        |
| [0.9.2](#092) | Types/constants colocation rollout               |
| [0.9.0](#090) | PSH1 security hardening                          |
| [0.8.0](#080) | VideoLounge, i18n, preloader, AI switch          |
| [0.7.0](#070) | Moderation helpers, localization bootstrap       |
| [0.6.0](#060) | Content approval, colocation                     |
| [0.5.0](#050) | ACL, remember-me, modular routes                 |
| [0.4.0](#040) | Albums, blog, reels, chat, wall                  |
| [0.3.0](#030) | Social features and grid list                    |
| [0.2.0](#020) | Husky, face routing, Cypress E2E                 |
| [0.1.0](#010) | React SPA foundation                             |

## [Unreleased]

### Added

### Changed

### Fixed

---

## [1.2.0]

### Added

- **GPL-19 — the missing portal case in the global-app-preloader test bundle.** `src/components/LanguageRouter/__tests__/LanguageRouter.test.tsx` renders the real `AppBootstrapGate` around the real `LanguageRouter` on a deep localized entry (`/en/homepage`, `/sk/homepage`) and pins the two rules from §3.6.2 of the preloader prompt: while faces config is still loading there is **exactly one** full-viewport loader and the routed page is not mounted; once the gate opens the page renders and **no** second full-screen loader replaces it — no `global-app-preloader`, no `role="status"`, and none of the legacy `Loading routes configuration...` / `Loading...` shells. The second case proves the gate does not aggregate URL language sync: with `ensureLanguageLoaded('sk')` left pending forever, the deep-linked page is already on screen and `changeLanguage` has not run.
- **Bootstrap / global preloader section in the shared localization guide** (`many_faces_main/docs/guides/static-localization-and-i18n.md`) — the localization fetch is the first mandatory cold-start step, so it now sits in context: the two-stage shell (pre-React `index.html` markup re-emitted by `renderBootstrapLoading`, then `AppBootstrapGate` inside React), a Mermaid flow of the whole cold start including the i18n-error retry path, the readiness-flag table (`i18nReady` always true inside the tree, the `isSessionHydrated` latch, `faceConfigReady`, the error branch), and links to the preloader prompt and tokens guide.
- **Cold-start section with a bootstrap Mermaid diagram in the portal README** — first-paint handover, the `AppBootstrapGate` readiness inputs, the faces-config error branch, and the fact that `LanguageRouter` runs after the gate.

### Changed

- **Grid form and card copy moved off hardcoded English** — `AlbumForm`, `BlogForm` and `ChatRoomCard` now render every user-visible string through `t()` instead of literals, matching their already-localized siblings. Covers headings, field labels, placeholders, select options, the images legend, cancel/create/update actions, save-failure fallbacks, and the chat-room member count, visibility badges and last-activity line. Keys are declared in `src/components/grid/gridBlockI18n.ts` under `form.*`, `albumForm.*`, `blogForm.*` and `chatRoomCard.*`; `AlbumForm`'s `ALBUM_TYPES` / `MEDIA_TYPES` constants now carry `labelKey` + `defaultLabel` instead of a baked-in `label` so option copy is translated at render time. Every call site uses the repo-wide `t(key, 'English fallback')` form, so the UI keeps rendering the same English until the matching `PortalResources.resx` entries land backend-side, then picks up sk/cz with no further frontend change. This closes the `[ ] i18n` rows the grid face-scope rollout prompt left open for these three components.

---

## [1.1.5]

### Fixed

- **`yarn type-check` was a no-op — the portal had no TypeScript gate at all.** The script ran `tsc --noEmit`, but the root `tsconfig.json` is `"files": []` with project references, so plain `tsc` (without `--build`) checked the root project — which contains zero files — and exited 0 while the referenced `tsconfig.app.json`/`tsconfig.node.json` were never visited. Proven by injecting `const x: number = 'nope'` into `src/App.tsx`: `yarn type-check` still exited 0. Since `vite build` does not type-check either, nothing in `yarn validate` or CI was checking types. The script is now `tsc --build --noEmit`, which visits the referenced projects; re-running the same probe exits 2 as it should. The source tree needed no changes — it type-checks clean today — so this closes the hole without a fix backlog. Note that `tsconfig.app.json` still excludes `__tests__`/`*.test.*`, so test files remain outside the gate; that is the pre-existing convention and is left as-is.

---

## [1.1.4]

### Added

- **Face selection edge tests (`REF-F1…F6`)** — `src/contexts/__tests__/FaceConfigContext.faceSelection.test.tsx` closes the last missing family from the Phase A refactor matrix: URL-driven face sync with zero `localStorage` writes, the authenticated `lastSelectedFaceId` cold-start hint, fallback to the first available face when the stored id is stale, the guest `/homepage` no-persistence rule, and the `markFaceVisited` + profile `PUT` side effects of `selectFace`. The real `useFacesConfigQuery` runs against a real `QueryClient` so the faces list arrives asynchronously as it does in the browser — a synchronous stub hides the mount-ordering the family exists to pin.
- **Context memoisation edge tests (`REF-X1…X2`)** — `FaceConfigContext.memoisation.test.tsx` and `features/profileDetail/context/__tests__/FaceMemberDetailProvider.test.tsx` assert referential stability of the provider values and the render count of a `React.memo` consumer, plus a sensitivity case proving a genuine dependency change still propagates.
- **Documentation cross-link** — the README documentation table now points at [`docs/guides/fe-portal-display-preferences.md`](../docs/guides/fe-portal-display-preferences.md) (storage policy and one-time legacy migration).

### Fixed

- **`useInvalidateFacesConfig` returned a new function on every render**, which defeated the Phase A provider memo it feeds: the callback is a dependency of `FaceConfigContext.selectFace`, which is in turn a dependency of the memoised context value, so the whole face-config context object was rebuilt on every parent render and every consumer re-rendered with it. The callback is now wrapped in `useCallback` keyed on the (stable) `queryClient`. Behavior of the invalidation itself is unchanged; `REF-X1` fails without this fix.

---

## [1.1.3]

### Fixed

- **Cleared every high-severity `yarn npm audit` advisory.** Three direct dependencies were raised to the first release carrying the fix, each staying inside its current major: `vite` `^8.0.13` → `^8.0.16` (resolves 8.1.5) for [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff), a `server.fs.deny` bypass via Windows alternate path forms (vulnerable `>=8.0.0 <=8.0.15`, dev-server only); `axios` `^1.16.1` → `^1.18.0` (resolves 1.18.1) for [GHSA-gcfj-64vw-6mp9](https://github.com/advisories/GHSA-gcfj-64vw-6mp9), where the Node HTTP adapter could reuse an inherited proxy after interceptor config cloning; and `form-data` `^4.0.5` → `^4.0.6` for [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx), CRLF injection through unescaped multipart field names. Raising the declared floor (rather than pinning) means the vulnerable range can never be re-resolved. All three are direct dependencies, so no `resolutions` entry was needed. `yarn npm audit --severity high` now reports "No audit suggestions"; validate, 617 tests and build are green on the new versions with no source changes. This unblocks the CI audit gate (SHV2 CI-1), which can only fail the build on high/critical once no such advisory is outstanding.

---

## [1.1.2]

### Fixed

- **API-supplied image URLs reached `<img src>` without the HTTPS allow-list (PSH1-D3, FE-P3).** `avatarUrl` (member avatars), `coverUrl` (story covers) and the first blog `imageUrl` come straight from the API but were bound directly to an image `src`, so a hostile or misconfigured response could inject an arbitrary URL (`javascript:`, `data:`, a plain-`http:` tracker) into the DOM on a page that also holds the user's session — only `BlogDetailPage` and the reel surfaces went through `sanitizeMediaUrl`. Every remaining sink now uses the same shared allow-list (HTTPS origins plus backend-signed `/api/uploads/serve` links carrying `sig`/`exp`):
  - a new shared `MediaImage` component covers the raw `<img src={apiUrl}>` sites (`ProfileHeroSection`, `Header` profile panel ×2, `EditProfileTab` global/face avatar previews, `FaceProfilesListPage`, `StoriesListPage`). `MediaImageProps` omits `src` from the passthrough `<img>` attributes, so a future call site cannot bypass sanitization; on a rejected URL it renders the call site's existing "no image" fallback (the same `UserCircle` / `ImageIcon` glyph already shown for a missing avatar or cover), so a blocked image is indistinguishable from an absent one and no layout hole appears.
  - `profileAvatarUrl()` and `storyRingImageUrl()` in `gridDisplayHelpers` now sanitize before returning, which covers every grid surface at once (`UserProfile`, `UserProfileGrid`, `UserProfileCarousel`, `Story`, `StoryGrid`, `StoryCarousel`, `ChatRoomCard`, `VideoLoungeCard`, `LivePanel`, `LobbyPanel`). A rejected URL degrades to the neutral initials / "Story" placeholder those helpers already return when the API sends no image.
  - the duplicated `blogCover()` helpers in `Blog`, `BlogGrid` and `BlogCarousel` sanitize the first blog image and fall back to the existing blog placeholder, matching `BlogDetailPage`.
  - `useStoryRingSlideshow` sanitizes each hover-slideshow frame from `GET /api/stories/{id}` and falls back to the (already sanitized) default cover.

  `GridMediaImage` is deliberately left accepting a raw `src`: it also carries locally generated `data:` placeholders (`albumCoverPlaceholderUrl`, `wallTicketListingImageUrl`) that the allow-list must not see. Covered by `PSH1-T-D15 … D19c` in `src/components/MediaImage/__tests__/MediaImage.security.test.ts` (asserted against the rendered DOM) and `PSH1-T-D20 … D23b` in `src/components/grid/gridDisplayHelpers/__tests__/gridDisplayHelpers.security.test.ts`.

---

## [1.1.1]

### Fixed

- **Reel media URLs from the API were rendered without the HTTPS allow-list (PSH1-D3, FE-P3).** `ReelItem.videoUrl` comes straight from `GET /{face}/api/Reels` but was bound directly to `<video src>` in `Reel`, `ReelGrid`, `ReelCarousel` and `ReelDetailPage`, so a hostile or misconfigured API response could inject an arbitrary URL (`javascript:`, `data:`, a plain-`http:` tracker) into the DOM — album and blog media already went through `sanitizeMediaUrl`. All four reel surfaces now render through a new shared `ReelVideo` component that passes the value through the existing `sanitizeMediaUrl` allow-list (HTTPS origins plus backend-signed `/api/uploads/serve` links with `sig`/`exp`) and renders nothing when the URL is rejected, matching the blog image behaviour in `BlogDetailPage`. `ReelVideoProps` omits `src` from the passthrough `<video>` attributes so a future call site cannot bypass sanitization. Covered by `PSH1-T-D10 … D14` in `src/components/grid/ReelVideo/__tests__/ReelVideo.security.test.ts`, which asserts against the rendered DOM.

---

## [1.1.0]

### Added

- **Content-Security-Policy baseline on the static host (PSH1-E1/E2, FE-P4).** `nginx.conf` now sends a `Content-Security-Policy` (`script-src 'self'`, `style-src 'self' 'unsafe-inline'` for the inline preloader, `connect-src 'self' https: wss:`, `frame-ancestors 'self'`, `object-src 'none'`) plus a `Referrer-Policy: strict-origin-when-cross-origin` header. Documented in [`docs/SECURITY.md`](./docs/SECURITY.md) as a compensating control for `localStorage` token storage (DOC-4), including the HTTPS-dev/BFF follow-up notes.

---

## [1.0.5]

### Fixed

- **Face page grid rendered every block full-width and stacked instead of the admin-defined responsive layout.** `PageGridItemShell` was a plain (non-`forwardRef`) component with a fixed prop signature, so it silently dropped the `style` (absolute position + size), `className` (`react-grid-item …`) and `ref` that `react-grid-layout` injects into each grid item via `cloneElement`. Without those the items lost their absolute placement and reflowed to the full container width. The shell is now a `forwardRef` that forwards the injected props onto its root node — merging the injected class with `page-grid-item` and composing react-grid-layout's measuring ref with the lazy-load in-view ref so both keep working.

---

## [1.0.4]

### Fixed

- **Post-login faces reload used a stale token.** `FaceConfigContext.reload()` called the query's `refetch()`, which is bound to the closure token from the previous render — still `null` immediately after login — so it fetched the public-only faces list, the preferred private face was never picked, and the redirect stayed on `/public/home`. It now fetches `getFacesConfig()` with the explicit effective token (e.g. the freshly-issued one passed by `LoginPage`) and seeds the React Query cache under that token's fingerprint key, so `useFacesConfigQuery(token)` already has the authenticated list the moment the provider re-renders with the new token. (Complements the backend seeder fix that makes private faces available in the first place.)

---

## [1.0.3]

### Added

- Edge-case tests for three previously-untested utilities (unit-test-gap-fill): `formatMessageTime` (nullish/unparseable input, same-day time-only vs other-day month+time, default-now boundary), `globalPreloaderVanillaShell` (accessible status markup, exactly-three-dot spinner, `prefers-reduced-motion` guard, CSS-only head-style helper), and `portalAuthSession` (logout reset delegates to `clearLocalAuthSession`, defaults to `localStorage` + axios `setAuthToken`).

---

## [1.0.2]

### Added

- Edge-case tests closing out the gradient-animation preference feature (prompt Phase B/C/D): `GradientAnimationPreferenceContext.test.tsx` (guest vs authenticated source of truth, `prefers-reduced-motion` override, optimistic profile-cache write-back, rollback + toast on a failed save, `isUpdating`) and `AnimatedGradientToggle.test.tsx` (checked state from the raw want flag, disabled under reduced motion / while saving, hint text swap). The two previously-untested units of an otherwise-shipped feature now have coverage.

---

## [1.0.1]

### Changed

- Hardened `logRedaction`: it now recurses into nested objects/arrays (with a depth guard) so a token under `{ headers: { authorization } }` is redacted, and the free-text redactor catches `refresh_token=`/`token=`/`id_token=`/`api_key=`/`Bearer <jwt>` (previously only `access_token=`).
- Cleaned the public `HomePage` guest landing — removed the leftover `"Show All Toast Types"` debug button and `"hello fe"` placeholder, and i18n'd the title/greeting via the `t(key, fallback)` pattern.

### Fixed

- **Logout cache leak**: `clearAuthAndCapabilitiesQueries` only purged `['auth']`/`['meCapabilities']`, so the non-fingerprinted per-user/per-face roots (`['face']` grid + social, `['profile']`, `['myContentSubmissions']`, `['wall']`, `['videoLoungeLive']`, `['facesConfig']`) survived logout and a new session could read the previous one's data. They are now all dropped (REQ-SECURITY-CACHE).
- `EditProfileTab` name fields could not be cleared: a render-phase `setState` resynced the field from the unsaved profile whenever it was empty, so it snapped back. Replaced with an effect gated by a "user has edited" ref.
- `LoginPage` called `navigate()` during render (a side-effect anti-pattern, and dead because `GuestRoute` already redirects); replaced with a declarative `<Navigate>`.
- `usePrefetchFaceHomeQueries` never reset its in-flight guard except via `cancelPrefetch`, so re-warming the same face was skipped forever; it now resets once the prefetch batch settles.
- `BlogForm` image list used an array index as the React key while items are deletable; keyed by URL instead.

---

## [1.0.0]

### Added

- Portal runtime performance v1 (**PT-RP1–30**): dynamic grid registry, TanStack grid queries, messenger merge, profile Query bootstrap, scoped messenger hub, chat room parallel load + hub manager, virtualized message lists, video lounge visibility-gated polling, wall tickets Query dedup, auth context split, face-home prefetch, bundle analyzer + `scripts/portal-perf-baseline.mjs`, AI degraded banner, Vitest/Cypress perf budgets, and docs (`runtime-performance-v1.md`, `ai-degraded-ux.md`, query appendix grid keys).

### Changed

- Memoized Album/Blog grid cards and AppRoutes Header/Footer props (PT-RP8, PT-RP11).
- `useGlobalProfile` shared cache for FaceConfig bootstrap (PT-RP5).

### Fixed

- Story ring slideshow clears intervals on unmount and hidden tab (PT-RP19).

---

## [0.9.3]

### Added

- Colocated `src/contexts/types.ts` (Phase 4) and Vitest colocation regression suite
  with `portalTypesColocationCiGate.ts`.
- Re-foldered flat `hooks/api/*` modules into colocated folders with `types.ts`.

### Changed

- Parent CI wires portal types colocation verify + regression tests.
- README version prose synced with `VERSION` file.

---

## [0.9.2]

### Added

- Add README shield badges (version, CI, stack tech) via sync-readme-badges.py.

---

## [0.9.1]

### Changed

- Document project author (Ladislav Kostolny, 01laky@gmail.com) in README and standard manifests.

---

## [0.9.0]

### Added

- Portal security hardening v1 (PSH1) regression tests.

### Fixed

- DOMPurify dev deps; profile grid and blog detail types; preloader layout.

## [0.8.0]

### Added

- Video lounge lobby and live UI; profile detail grid; de/fr/it languages.
- Global AI switch; global preloader and brand font; gradient animation preference.

### Changed

- Same-origin API on nginx dev proxy; Phase A DRY pass.

## [0.7.0]

### Added

- SHV2 PI-8 plain-text preview for pending blogs; localization bootstrap retry shell.
- Messenger moderation helpers; paginated list envelope parsing.

### Fixed

- Register password min 12; JWT exp-at-current-second; face home path after login.

## [0.6.0]

### Added

- Content approval UI; my submissions; backend localization fetch; two-step registration.

### Changed

- Component folder colocation convention.

## [0.5.0]

### Added

- Face-scoped grid data; remember-me login; ACL capabilities client; modular routes.

### Fixed

- Story grid layout; API and hub URLs prefixed with face segment.

## [0.4.0]

### Added

- Albums, blog WYSIWYG, reels, face profiles, stories, chat rooms, face wall page.

## [0.3.0]

### Added

- Friend requests, messenger, notifications, users list, face role slide-out.

## [0.2.0]

### Added

- Husky/commitlint; face path routing in API client; Cypress E2E tests.

## [0.1.0]

### Added

- React/TypeScript SPA with OAuth2 and Docker dev scripts.

[Unreleased]: https://github.com/01laky/many_faces_portal/compare/v1.2.0...HEAD
[0.9.2]: https://github.com/01laky/many_faces_portal/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/01laky/many_faces_portal/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/01laky/many_faces_portal/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/01laky/many_faces_portal/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/01laky/many_faces_portal/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/01laky/many_faces_portal/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/01laky/many_faces_portal/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/01laky/many_faces_portal/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/01laky/many_faces_portal/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/01laky/many_faces_portal/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/01laky/many_faces_portal/releases/tag/v0.1.0
[1.2.0]: https://github.com/01laky/many_faces_portal/compare/v1.1.5...v1.2.0
[1.1.5]: https://github.com/01laky/many_faces_portal/compare/v1.1.4...v1.1.5
[1.1.4]: https://github.com/01laky/many_faces_portal/compare/v1.1.3...v1.1.4
[1.1.3]: https://github.com/01laky/many_faces_portal/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/01laky/many_faces_portal/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/01laky/many_faces_portal/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/01laky/many_faces_portal/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/01laky/many_faces_portal/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/01laky/many_faces_portal/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/01laky/many_faces_portal/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/01laky/many_faces_portal/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/01laky/many_faces_portal/compare/v1.0.0...v1.0.1
