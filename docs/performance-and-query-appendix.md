# Portal — TanStack Query performance appendix

**Scope:** `many_faces_portal` only. Monorepo UX guides: [`docs/guides/fe-portal-profile-detail-grid.md`](../../docs/guides/fe-portal-profile-detail-grid.md), [`docs/guides/acl-and-capabilities.md`](../../docs/guides/acl-and-capabilities.md).

## Global Query defaults

Defined in `src/providers/QueryProvider.tsx`:

| Option                 | Value      | Rationale                                                  |
| ---------------------- | ---------- | ---------------------------------------------------------- |
| `refetchOnWindowFocus` | `false`    | Social feeds are not trading dashboards                    |
| `retry`                | `1`        | Surface errors; user can retry action                      |
| `staleTime`            | **5 min**  | Default for list/read-mostly queries                       |
| `gcTime`               | **20 min** | Slightly longer than admin — users switch faces more often |

## Per-hook matrix (not only globals)

| Hook / area              | Query key shape                                    | `staleTime` | Notes                                           |
| ------------------------ | -------------------------------------------------- | ----------- | ----------------------------------------------- |
| `useAuthToken`           | `authKeys.*`                                       | **60s**     | Must track expiry + cross-tab sooner than lists |
| `useMeCapabilities`      | `['me', 'capabilities']`                           | **60s**     | ACL rarely changes; bounded `gcTime`            |
| `useProfile`             | `['profile']` or `['profile', faceId]`             | per hook    | Avatar + profile; invalidate on face switch     |
| `useGlobalProfile`       | `['profile']`                                      | per hook    | Bootstrap `lastSelectedFaceId` (PT-RP5)         |
| `useFacesConfigQuery`    | `['faces', 'config', tokenFingerprint]`            | **5 min**   | Face switch invalidates on visit (PT-RP22)      |
| Grid list hooks (PT-RP2) | `['face', faceId, '<resource>']` — see table below | **5 min**   | Dedup across blocks; IO-gated fetch (PT-RP16)   |
| `useWallTicketsQuery`    | `['wall', 'tickets', faceId, page, pageSize]`      | **60s**     | Shared host meta + section list (PT-RP14)       |
| Video lounge live        | `['videoLoungeLive', faceId, loungeId, phase]`     | poll 12s    | Paused when tab hidden (PT-RP13)                |
| Mutations                | defaults                                           | —           | Explicit `invalidateQueries` after writes       |

### Grid query keys (`gridQueryKeys`)

| Resource      | Key helper                           | Example                        |
| ------------- | ------------------------------------ | ------------------------------ |
| Albums        | `gridQueryKeys.albums(faceId)`       | `['face', 42, 'albums']`       |
| Blogs         | `gridQueryKeys.blogs(faceId)`        | `['face', 42, 'blogs']`        |
| Stories       | `gridQueryKeys.stories(faceId)`      | `['face', 42, 'stories']`      |
| Reels         | `gridQueryKeys.reels(faceId)`        | `['face', 42, 'reels']`        |
| Ads / wall    | `gridQueryKeys.ads(faceId)`          | `['face', 42, 'ads']`          |
| User profiles | `gridQueryKeys.userProfiles(faceId)` | `['face', 42, 'userProfiles']` |
| Chat rooms    | `gridQueryKeys.chatRooms(faceId)`    | `['face', 42, 'chatRooms']`    |
| Video lounges | `gridQueryKeys.videoLounges(faceId)` | `['face', 42, 'videoLounges']` |

Bound single tiles (`boundChatRoomId` / `boundVideoLoungeId` in the grid JSON) use narrow child keys of the list keys via `useFaceGridItemQuery`:

| Resource        | Key helper                                    | Example                           |
| --------------- | --------------------------------------------- | --------------------------------- |
| Bound chat room | `gridQueryKeys.chatRoom(faceId, roomId)`      | `['face', 42, 'chatRooms', 7]`    |
| Bound lounge    | `gridQueryKeys.videoLounge(faceId, loungeId)` | `['face', 42, 'videoLounges', 7]` |

Unbound single tiles (`album`, `blog`, `story`, `reel`, `ad`, `userProfile`, and unbound `chatRoom` / `videoLounge`) reuse the **same list hooks/keys** as their Grid/Carousel siblings and render the first item — no extra request when a list block for the same resource is on the page.

**Budget:** `FACE_HOME_API_BUDGET = 8` — unique grid keys on a typical face home should stay at or below this count (PT-RP20 / PT-RP29).

## Build decisions (recorded 2026-07-25)

### `build.modulePreload` — keep Vite default

**Decision: keep the default** (no `build.modulePreload` entry in `vite.config.ts`). The 2026-07-25 build emits **28 `<link rel="modulepreload">`** entries in `dist/index.html`, all pointing at chunks that are **statically imported** by the entry (`vendor-*`, `AuthContext`, API service chunks, form chunks) — i.e. modules the browser must fetch at bootstrap anyway before the app can render. The preload list lets those requests start in parallel with HTML parsing instead of being discovered link-by-link through the module graph; disabling it would only save the tiny preload polyfill while re-introducing a request waterfall across the ~28-chunk eager graph. Lazy route/grid chunks are not preloaded (route-intent prefetch, PT-RP25, covers those deliberately). Revisit only if the eager static graph shrinks to a handful of chunks.

### `react-toastify` CSS — measured waiver

`ReactToastify.css` is only imported **dynamically** (lazy `ToastHost`, PT-RP27) — nothing imports it in `main.tsx`. The `manualChunks` catch-all does fold it into the shared `vendor` CSS chunk (eagerly linked in `index.html`), but the measured cost in the 2026-07-25 build is trivial: the whole vendor CSS chunk is **14.1 kB raw / 2.65 kB gzip**, of which the Toastify rules are ~10.3 kB raw (**≈ 1.9 kB gzip share**; the standalone source file is 17.4 kB raw / 2.94 kB gzip). That is far under the 5 kB-gzip threshold for restructuring, so no chunking change is made — recorded here as a waiver. Re-measure if react-toastify is upgraded or the vendor CSS chunk grows.

## Diagram: face-scoped fetch

```mermaid
flowchart LR
  URL[Face URL prefix]
  FC[FaceConfigContext]
  Hook[useXxxApi]
  API["/{face}/api/..."]
  URL --> FC
  FC --> Hook
  Hook --> API
```

## Related prompt

- [`docs/prompts/fe-performance-and-refactor-agent-prompt.md`](../../docs/prompts/fe-performance-and-refactor-agent-prompt.md) — lazy routes, thin `App.tsx`, Query defaults (mostly implemented).
- [`docs/runtime-performance-v1.md`](./runtime-performance-v1.md) — PT-RP1–30 index and architecture diagrams.
