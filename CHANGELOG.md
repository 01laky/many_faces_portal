# Changelog

All notable changes to **`many_faces_portal`** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — **version headings only, no dates**. SemVer: [`VERSION`](./VERSION).

### Release index

| Version       | Theme                                       |
| ------------- | ------------------------------------------- |
| [1.0.3](#103) | Untested-utility edge tests (test-gap fill) |
| [1.0.2](#102) | Gradient-animation preference edge tests    |
| [1.0.1](#101) | Review pass: cache leak, profile, redaction |
| [1.0.0](#100) | Portal runtime performance v1 (PT-RP1–30)   |
| [0.9.3](#093) | Contexts colocation + hooks/api re-folder   |
| [0.9.2](#092) | Types/constants colocation rollout          |
| [0.9.0](#090) | PSH1 security hardening                     |
| [0.8.0](#080) | VideoLounge, i18n, preloader, AI switch     |
| [0.7.0](#070) | Moderation helpers, localization bootstrap  |
| [0.6.0](#060) | Content approval, colocation                |
| [0.5.0](#050) | ACL, remember-me, modular routes            |
| [0.4.0](#040) | Albums, blog, reels, chat, wall             |
| [0.3.0](#030) | Social features and grid list               |
| [0.2.0](#020) | Husky, face routing, Cypress E2E            |
| [0.1.0](#010) | React SPA foundation                        |

## [Unreleased]

### Added

### Changed

### Fixed

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

[Unreleased]: https://github.com/01laky/many_faces_portal/compare/v1.0.3...HEAD
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
[1.0.3]: https://github.com/01laky/many_faces_portal/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/01laky/many_faces_portal/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/01laky/many_faces_portal/compare/v1.0.0...v1.0.1
