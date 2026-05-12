# many_faces_portal — performance & data layer appendix

Companion to [`docs/prompts/fe-performance-and-refactor-agent-prompt.md`](../../docs/prompts/fe-performance-and-refactor-agent-prompt.md). For the admin SPA mirror, see [`many_faces_admin/docs/performance-and-query-appendix.md`](../../many_faces_admin/docs/performance-and-query-appendix.md) when both submodules are checked out. Copy sections into a PR as evidence or waivers.

## Node / toolchain

- **Vite 8:** Node **20.19+** or **22.12+**; see `many_faces_portal/.nvmrc` and `yarn check-node`.

## TanStack Query — defaults vs hooks

| Layer | `staleTime` | `gcTime` / notes |
| ----- | ----------- | ---------------- |
| **Global** (`QueryProvider.tsx`) | `5 * 60 * 1000` | `20 * 60 * 1000`; inline matrix documents auth + capabilities |
| **`useAuthToken`** | `60_000` | `10 * 60 * 1000` |
| **`useMeCapabilities`** | `60_000` | `15 * 60 * 1000` |
| **`useProfile`** (and related) | inherits default | `gcTime: 15 * 60 * 1000` where set in hook |

**`enabled`:** detail/list hooks use `enabled: !!id` or token guards as implemented per hook.

## ACL / `/me/capabilities`

| Consumer | Role |
| -------- | ---- |
| **`MeCapabilitiesWarmup`** in `AuthContext.tsx` | Single **`useMeCapabilities(token, Boolean(token))`** for session-wide cache. |
| **`useAuthApi`** | **`meCapabilitiesKeys`** for **logout / query cleanup** only. |

## Session / logout (source of truth)

- **Axios interceptors:** **401** handling, refresh queue, redirect / `forceLogout` patterns (see `interceptors.ts` and auth docs).
- **`AuthContext`:** login, logout, refresh, `localStorage` keys; capabilities warmup child.
- **React Query:** token + capabilities keys cleared on logout paths.

## Phase D–style waivers (deferred unless product asks)

| Topic | Decision |
| ----- | -------- |
| **Further route splitting** | Many routes already lazy in `routes/lazyPages.tsx`; deeper `App.tsx` decomposition not required (shell is thin). |
| **Lighthouse / bundle visualizer** | Run on `yarn build && yarn preview` and attach tables in performance PRs; not a CI gate. |
| **Messenger / SignalR dedup** | Messenger hub lifecycle is context-owned; no second full-hub builder extracted yet—acceptable while single hub pattern holds. |

## Vite build

- **`manualChunks`** split vendors (react-dom, router, query, signalr, quill, react, grid layout, radix, bootstrap, i18n, forms, axios) to keep default `vendor` smaller.
- **`css.preprocessorOptions.scss.silenceDeprecations`** reduces Bootstrap Sass deprecation noise.
