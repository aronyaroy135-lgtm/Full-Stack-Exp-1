# Post Composer

**Aim:** Design and develop a dynamic post composer interface supporting multiple platforms with constraint validation.

Write one post, pick target platforms (X, LinkedIn, Instagram, Facebook, Threads, Bluesky), optionally customise the text per platform, and see live validation against each platform's rules. Publishing is blocked until every selected platform passes.

No build step and no dependencies. Plain HTML, CSS and JavaScript.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Run the experiments (tests)

```bash
node tests/validator.test.js   # Node 18+
# or
npm test
```

## Project structure

```
post-composer/
├── index.html              UI shell
├── css/style.css           Styling (light/dark)
├── js/
│   ├── platforms.js        Per-platform constraint config (data only)
│   ├── validator.js        Pure validation logic (no DOM; testable in Node)
│   └── app.js              UI state, rendering, events
├── tests/validator.test.js 18 experiments
├── .github/workflows/test.yml  CI: runs tests on every push
├── package.json
└── README.md
```

## Design

| Concern | Decision |
|---|---|
| Extensibility | A platform is one object in `platforms.js`. Add an entry and the UI and validator pick it up. |
| Testability | `validator.js` is pure (input in, result out) and loads in both browser and Node. |
| Dynamic composing | Shared text plus optional per-platform overrides (tab shows a dot when overridden). |
| Correct counting | Characters are counted per grapheme (emoji = 1). Platforms with fixed URL length (X = 23) are handled. |
| Safety | UI is built with `textContent`, never `innerHTML`, so user text cannot inject markup. Publish re-validates at click time. |

## Constraints modelled

| Platform | Chars | Hashtags | Media | Notes |
|---|---|---|---|---|
| X | 280 | 10 | 4 | URLs count as 23 |
| LinkedIn | 3000 | 5 | 9 | |
| Instagram | 2200 | 30 | 10 | Media required, no links in caption |
| Facebook | 63206 | 30 | 10 | |
| Threads | 500 | 1 | 10 | Max 5 links |
| Bluesky | 300 | 8 | 4 | Images only |

These values are a reasonable snapshot for the experiment. Platform limits change, so check each platform's current documentation before using this in production.

## Experiments

| ID | Hypothesis | Result |
|---|---|---|
| E1-E4 | Boundary: 280 passes, 281 fails on X; same text passes on LinkedIn | Pass |
| E5 | Emoji with skin tone counts as 1 character | Pass |
| E6-E7 | URL length rule applies on X only | Pass |
| E8-E9 | Empty post rejected; media-only post accepted | Pass |
| E10-E12 | Instagram requires media and rejects links | Pass |
| E13-E14 | Hashtag counting ignores `#` inside words/URLs | Pass |
| E15-E16 | Media count and type limits | Pass |
| E17 | Warning near limit without blocking | Pass |
| E18 | Platforms validated independently | Pass |

## Limitations

- Publishing is simulated. A real app needs each platform's API and OAuth.
- Media is tracked by name and type only; file size and dimensions are not checked.
- Counting rules are simplified (for example, X mentions and some Unicode weighting are not modelled).

## Upload to GitHub

See the steps in the chat reply, or:

```bash
git init && git add . && git commit -m "Initial commit: post composer"
git branch -M main
git remote add origin https://github.com/<you>/post-composer.git
git push -u origin main
```
