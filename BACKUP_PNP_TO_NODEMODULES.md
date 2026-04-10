# Backup Plan: Switch from PnP to node_modules

If TypeScript editor still doesn't work with PnP, we can switch to node_modules mode:

1. Edit `.yarnrc.yml`:

   ```yaml
   nodeLinker: node-modules
   ```

2. Run:

   ```bash
   yarn install
   ```

3. Remove PnP-specific settings from `.vscode/settings.json`:
   - Remove `typescript.tsdk` (use global TypeScript)
   - Remove PnP exclusions

4. Restart TypeScript server

This will create node_modules but still use Yarn Berry for package management.
