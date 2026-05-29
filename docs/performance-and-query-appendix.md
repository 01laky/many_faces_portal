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

**Budget:** `FACE_HOME_API_BUDGET = 8` — unique grid keys on a typical face home should stay at or below this count (PT-RP20 / PT-RP29).

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
