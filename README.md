# Triple Tidy

A cozy three-of-a-kind tile puzzle. Lift a free tile onto the seven-slot tray, clear matches of three, and tidy the pile. Overflow the tray and the level is lost.

Playable in a mobile browser, installable as a PWA, and fully offline after the first visit.

## Play

Open `index.html` from a local static server, or the GitHub Pages build of this repository.

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

## Verify levels

All 30 levels are generated from a fixed seed and checked by a Node solver:

```bash
npm run test:levels
```

## End-to-end tests

```bash
npx playwright test
```

Viewport: 390×844. Screenshots are written to `screenshots/`.

## Helps

Each level has a limited number of free Undo, Shuffle, and Hint uses. `js/monetization.js` holds future hooks for rewarded ads and a “Remove ads” purchase. No ads or data collection ship in this build.
