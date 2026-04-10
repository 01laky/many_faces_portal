# Editor Setup for Yarn PnP

## Quick Fix for Red Underlines

The red underlines in your editor are because Cursor/VS Code needs the **ZipFS** extension to work with Yarn PnP.

## Automatic Installation

If you have VS Code/Cursor CLI installed, run:

```bash
code --install-extension arcanis.vscode-zipfs
# or
cursor --install-extension arcanis.vscode-zipfs
```

## Manual Installation

1. Open Extensions panel: **Cmd+Shift+X** (Mac) or **Ctrl+Shift+X** (Windows/Linux)
2. Search for: **ZipFS**
3. Install: **arcanis.vscode-zipfs**
4. Also install: **ESLint** (dbaeumer.vscode-eslint) if not already installed

## After Installation

1. **Restart TypeScript Server:**
   - Press **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows/Linux)
   - Type: `TypeScript: Restart TS Server`
   - Press Enter

2. **Reload Window:**
   - Press **Cmd+Shift+P** (Mac) or **Ctrl+Shift+P** (Windows/Linux)
   - Type: `Developer: Reload Window`
   - Press Enter

## Verification

After reloading, the red underlines should disappear. You can verify by:

- Opening `src/App.tsx` - no red underlines
- Running `yarn type-check` in terminal - should pass

## What's Already Configured

✅ Yarn PnP SDKs generated (`.yarn/sdks/`)
✅ TypeScript SDK configured (`.vscode/settings.json`)
✅ ESLint SDK configured
✅ Extension recommendations set (`.vscode/extensions.json`)

You just need to install the extensions!
