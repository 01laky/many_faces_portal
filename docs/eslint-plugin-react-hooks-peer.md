# ESLint 10 + `eslint-plugin-react-hooks` (Yarn 4)

Canonical write-up: **[`docs/guides/development.md`](https://github.com/01laky/many_faces_main/blob/main/docs/guides/development.md#eslint-10-and-eslint-plugin-react-hooks-many_faces_portal-many_faces_admin)** in **`many_faces_main`**.

**Summary:** both SPAs pin an **exact canary** of `eslint-plugin-react-hooks` whose `peerDependencies` include **ESLint ^10** (strategy **A2** in [`docs/prompts/eslint10-react-hooks-peer-yarn-agent-prompt.md`](https://github.com/01laky/many_faces_main/blob/main/docs/prompts/eslint10-react-hooks-peer-yarn-agent-prompt.md)).

Flat config extends **`reactHooks.configs.flat.recommended`** with **`eslint-config-prettier` last**.

**When to remove the pin:** when stable `eslint-plugin-react-hooks` lists ESLint 10 in peers and `yarn install` has no `YN0060` for that pair — then bump to stable and drop this note.
