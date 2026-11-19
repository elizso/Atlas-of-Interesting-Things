# ✳ Atlas — Geometry Lab

A tiny interactive museum of form, light and a little mathematical mischief. Rotate objects, play with shaders and materials, deform their geometry, and export your favorite experiments.

Built to be **beautiful first and wonderfully easy to tinker with**.

## Start playing

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Visit the local URL shown in your terminal. Production build:

```bash
npm run build
```

## The exhibits

- **Forms:** torus knot, sphere, icosahedron, cube
- **Materials:** ceramic, chrome, surface normals, wireframe, cel shading
- **Manipulations:** twist, animated normal displacement, rotation, light intensity
- **Utilities:** orbit, zoom, reset, surprise-me randomiser, PNG export

## Where to experiment

| File | What it does |
| --- | --- |
| `src/geometry.ts` | Creates shapes and deforms vertices. The most fun place to start coding. |
| `src/materials.ts` | Changes surface properties and shading models. |
| `src/main.ts` | Three.js scene, lights, camera, UI wiring, animation loop. |
| `src/style.css` | The museum's design. |
| `index.html` | The workbench interface. |

### Tiny coding challenge

Open `src/geometry.ts` and change the wave equation. Try introducing a second oscillation, or twist based on the distance to the axis rather than the height. All deformations start from a stored copy of the original mesh, so they will not accumulate or collapse the object over time.

## Publish to GitHub Pages

The easiest option is to deploy `dist/` using a GitHub Actions workflow. If deploying to `https://username.github.io/repository/`, set `base: '/repository/'` in `vite.config.ts` or use `vite build --base=/repository/` (and update the build command in your workflow). For a custom domain or root Pages site, `/` works.

## Notes

- Everything runs locally in the browser; nothing is uploaded.
- Chrome uses a Three.js generated room environment instead of external asset downloads.
- Google Fonts are optional; local fallback fonts work offline.
- PNG export captures the canvas with a transparent background.
- Current version is a small experimental project, not a 3D modelling application.

MIT License. Made for the joy of making things.
