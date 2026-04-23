### React + Typescript + Konva.js

## Development

Install dependencies:

```bash
npm install
```

Run the Vite app in Electron:

```bash
npm run dev
```

This starts the Vite dev server and opens the Electron shell once the renderer is ready.

## Build

Create the production web and Electron bundles:

```bash
npm run build
```

Generate unsigned macOS installer artifacts:

```bash
npm run dist
```

Installers are written to `release/`.

## PNG Export

Inside Electron, PNG export uses the native macOS save dialog. In a regular browser, it falls back to the existing download behavior.

## Unsigned macOS App

The generated app is unsigned. macOS may block the first launch.

If that happens:

1. Open `System Settings -> Privacy & Security`.
2. Find the blocked app message near the bottom.
3. Click `Open Anyway`.

## Future Signing Upgrade

This setup is structured so Developer ID signing and notarization can be added later through `electron-builder` without changing the renderer bridge.
