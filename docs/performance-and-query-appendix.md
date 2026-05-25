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

| Hook / area         | `staleTime` | Notes                                           |
| ------------------- | ----------- | ----------------------------------------------- |
| `useAuthToken`      | **60s**     | Must track expiry + cross-tab sooner than lists |
| `useMeCapabilities` | **60s**     | ACL rarely changes; bounded `gcTime`            |
| `useProfile`        | per hook    | Avatar + profile; invalidate on face switch     |
| Mutations           | defaults    | Explicit `invalidateQueries` after writes       |

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
