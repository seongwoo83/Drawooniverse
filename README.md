# Drawooniverse

Drawooniverse is a React, TypeScript, and Konva drawing canvas published through GitHub Pages.

## Live site

- GitHub Pages URL: `https://seongwoo83.github.io/Drawooniverse/`
- Deployment source: GitHub Actions
- Deployment trigger: push to `main`

To make Pages serve the workflow output, set the repository Pages source to `GitHub Actions` in GitHub settings.

## Site flow

- Landing page: product introduction and entry point
- App page: `#/app`
- Main CTA: opens the drawing workspace directly in the browser

## Development

Install dependencies:

```bash
npm install
```

Run the browser app locally:

```bash
npm run dev:web
```

## Build

Create only the static web bundle used by GitHub Pages:

```bash
npm run build:web
```

## Browser behavior

- The app runs directly in the browser from GitHub Pages.
- Canvas history and viewport state are stored locally with IndexedDB.
- PNG export downloads the image in the browser.
