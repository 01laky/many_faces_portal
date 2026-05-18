# Portal components layout

Each UI block lives in its own folder next to its styles and barrel export.

## Convention

| Area            | Path pattern                                                             |
| --------------- | ------------------------------------------------------------------------ |
| Root components | `src/components/<Name>/<Name>.tsx` + optional `<Name>.scss` + `index.ts` |
| Grid blocks     | `src/components/grid/<Name>/<Name>.tsx` + optional SCSS + `index.ts`     |
| Radix wrappers  | `src/components/radix/<Name>/…`                                          |
| Pages           | `src/pages/<Name>/<Name>.tsx` + optional SCSS + `index.ts`               |
| Settings        | `src/features/settings/<Name>/…`                                         |

## New component

```text
src/components/<Name>/<Name>.tsx
src/components/<Name>/<Name>.scss
src/components/<Name>/index.ts   → export { Name } from './Name'
```

Import from outside via the folder barrel: `import { Name } from '../components/Name'`.

Siblings inside the same parent directory use `../OtherName`.

## Verification

From monorepo root:

```bash
node scripts/verify-portal-component-colocation.mjs
```

Helper for a single move:

```bash
node scripts/colocate-portal-component.mjs --name Header [--dry-run]
```
