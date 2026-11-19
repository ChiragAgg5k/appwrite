# Console navigation measurements

The Playwright journey opens a fictional organization, follows its project card to the Dashboard, opens Auth, and switches between Users and Templates. The script checks destination content, including the rendered email inside its preview frame. It records elapsed time since the browser click after two animation frames, then waits for the router to be idle at the destination. Each journey starts with a fresh browser context.

Copy `navigation.ts` into `apps/console` in the checkout being tested. With the repository's Bun version, run:

```sh
bun install --frozen-lockfile
bun run install-browsers
bun run build
PORT=4371 VITE_CONSOLE_PROFILE=cloud VITE_CONSOLE_PRE_LAUNCH=false bun run start
```

In a second terminal in the same directory:

```sh
bun navigation.ts 4371 baseline normal 6
bun navigation.ts 4371 baseline slow 6
bun navigation.ts 4371 baseline high 6
bun navigation.ts 4371 baseline high 1 video
```

The normal fixture waits 150 ms per API response. The slow fixture waits 1,200 ms for Recovery and 150 ms for every other response. The high-latency fixture waits 600 ms for every API response. Static assets come from the local server, with no CPU throttling. Playwright intercepts requests, so its browser HTTP cache is disabled. Warm visits exercise the Console's in-memory cache.

The comparison clips show a return to Templates in the high-latency fixture. Both run at original speed. The frames are synchronized to a marker inserted on click, then cropped 12 pixels from the top to remove the marker. All recorded screens contain fictional data.

The production spot-check used a separate read-only driver against one existing test project. The live measurements contain timings only.
