# eslint-plugin-react-hooks — ESLint 10 peer alignment

## Strategy: A2 (canary bridge)

- **Pinned version (exact):** `7.1.0-canary-705268dc-20260409`
- **ESLint config:** `eslint.config.js` registers the canary plugin but enables only **`react-hooks/rules-of-hooks`** and **`react-hooks/exhaustive-deps`** (not `configs.flat.recommended`, which in canary pulls in additional experimental rules). Opt in to the full preset when the codebase is ready.
- **Why:** `eslint-plugin-react-hooks@latest` (7.0.x) did not declare ESLint 10 in `peerDependencies`, which produced Yarn **`YN0060`** / **`YN0086`** while this workspace uses ESLint 10. The canary line widens peers to include **`^10.0.0`**.
- **Risk:** Canary is a pre-release channel; behavior and metadata can change without a major semver bump on npm tags.
- **Removal trigger:** When `npm view eslint-plugin-react-hooks@latest peerDependencies` shows `eslint` including **`^10.0.0`**, bump `package.json` to that **stable** version (range as team policy allows), run `yarn install --immutable`, then `yarn validate`, `yarn test`, and `yarn build`, and delete or rewrite this document.
- **Automation:** This submodule does not ship Renovate/Dependabot rules; treat `eslint-plugin-react-hooks` bumps as **manual** until stable supports ESLint 10 in peers.

## Upstream references

- [facebook/react#35758](https://github.com/facebook/react/issues/35758)
- [facebook/react#35720](https://github.com/facebook/react/pull/35720)

## Tracking issue

Open a repository issue titled **chore: replace eslint-plugin-react-hooks canary when @latest supports ESLint 10 peers**, link it from the PR that introduced the canary pin, and close it when stable is adopted.
