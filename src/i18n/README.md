# i18n (portal)

This app uses **react-i18next** for UI copy and localized **app routes** (`routes.*`).

## Canonical documentation

**Architecture, Mermaid diagrams, CMS vs static:**

- Monorepo: [`docs/guides/static-localization-and-i18n.md`](../../../docs/guides/static-localization-and-i18n.md)
- Conventions: [`docs/guides/i18n-conventions.md`](../../../docs/guides/i18n-conventions.md)

## Static UI (target)

| Piece | Role |
| ----- | ---- |
| `config.ts` | `initI18n()` — hydrates i18next from `GET /api/localization/portal` |
| `constants.ts` | `supportedLanguages`: `en`, `sk`, `cz` |
| `../utils/routeTranslations.ts` | Maps `routes.login` etc. to localized URL segments |
| `../api/faceApiRouting.ts` | `/api/localization` exempt from face prefix (with OAuth) |

**Source of truth:** `many_faces_backend/BeDemo.Api/Localization/Portal/*.resx` (not JSON in this repo after rollout).

**Transitional:** `locales/{en,sk,cz}.json` may still exist until centralized static i18n is merged.

## CMS page slugs (not in i18n JSON)

Per-page translated paths come from **faces config** (`pages[].routeTranslations`) and admin **PageRouteTranslations** in PostgreSQL. See the monorepo guide — section “CMS dynamic page routes”.

## Usage in components

```tsx
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';

function Example() {
  const { t } = useTranslation('common');
  // or: const { t } = useApp();
  return <h1>{t('pages.login.title')}</h1>;
}
```

### Change language

```tsx
const { i18n } = useTranslation();
await i18n.changeLanguage('sk'); // no second localization GET when all langs preloaded
```

## Adding or editing copy

1. Edit **portal** `.resx` files in `many_faces_backend` (see monorepo guide).
2. Restart backend; hard refresh browser.
3. Do **not** add keys only to one language — keep `en` / `sk` / `cz` in parity (CI).
