# Console navigation benchmark

Copy `benchmark.ts` into an installed `apps/console` checkout. Start the production Console build locally, install Playwright Chromium, then run the following with its port. Each run uses a fresh browser context per journey. All API data in the fixture and recordings is fictional.

```sh
bun benchmark.ts 4381 before normal 6
bun benchmark.ts 4381 before slow 6
bun benchmark.ts 4381 before slow 1 video
```

The timer starts on the captured DOM click and ends two animation frames after the expected row is visible with the fullscreen loader absent. The driver waits for the initial organization screen to finish revealing before starting. A journey visits Dashboard, Messages, Topics, Providers, then Dashboard again. It waits for the key row after each Dashboard visit. The CSV includes that separate measurement. The total reported in the PR sums the five click-to-content times and excludes time spent between clicks.

Normal API calls take 150 ms in the fixture. The slow profile delays project keys and Messaging providers to 1,200 ms each. The separate Cloud CSV reports router settlement plus two animation frames against a real project, with GET requests only. Production data and credentials are excluded from the recordings.

CSV stage labels are `before` (baseline), `exp` (active Messaging list only), `after` (background sibling prefetch, key card fetch on mount), and `key` (final build, background project key prefetch and 30-second reuse). Live CSV ports 4381 and 4384 identify the baseline and final build respectively.
