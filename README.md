# Lattice — 100 Landing Pages

A pure **HTML / CSS / JavaScript** dashboard showcasing **100 uniquely designed landing pages** for every kind of business and client. Atmosphere scenes use **[Three.js](https://threejs.org/)**.

## What’s inside

| Piece | Description |
| --- | --- |
| `index.html` | Curated gallery with search, category chips, grid/list views |
| `landing.html?id=N` | Full landing experience for page `1`–`100` |
| `js/businesses.js` | Catalog: 100 businesses, 20 palettes, 10 layouts, 6 3D scenes |
| `js/three-scene.js` | Shared Three.js atmosphere (orbs, particles, waves, geometry, rings, lattice) |
| `css/` | Dashboard + landing design systems |

## Categories (20)

Food & Beverage · Health & Wellness · Technology · Professional Services · Retail · Creative Studio · Home Services · Education · Travel & Hospitality · Finance · Real Estate · Automotive · Beauty & Spa · Fitness · Legal · Nonprofit · Entertainment · Construction · Agriculture · Logistics

## Run locally

Any static server works:

```bash
# Python
python3 -m http.server 8080

# Node
npx --yes serve -l 8080 .
```

Then open `http://localhost:8080`.

## Visual system

- **Photography-first** landing layouts with a curated 16-image library mapped by category
- **Subtle Three.js** accent (small hero orb only — not full-bleed backgrounds)
- 10 layout systems, 20 palettes, modern product marketing UI

## Stack constraints

- HTML, CSS, and vanilla JS only
- Three.js via CDN ES modules (`three@0.170.0`)
- No React, no build step required

## Keyboard

On a landing page: `←` / `→` previous / next page.

## License

MIT
