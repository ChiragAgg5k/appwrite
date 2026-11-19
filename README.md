# Sites navigation benchmark

Copy `benchmark.ts` to an installed `apps/console` checkout, install Playwright Chromium, and start a production build with the Cloud profile. Run each build with its own port. All records and recordings in this fixture are fictional.

```sh
bun benchmark.ts 4391 before normal 5
bun benchmark.ts 4391 before git 5
bun benchmark.ts 4391 before catalog 5
bun benchmark.ts 4391 before catalog 5 immediate
bun benchmark.ts 4391 before normal 5 populated
bun benchmark.ts 4391 before git 1 video
```

Each journey starts in Auth with a fresh Chromium context at 1440 × 900. The driver waits for the startup overlay to disappear, clicks Sites, opens the creation wizard, selects a template, then goes back twice. It records the click (or history navigation) to the destination control or heading plus two animation frames. On Sites the create action must be enabled. Separate columns track when the template card and Git provider link appear. The immediate case clicks Create without waiting for either. The populated-project control opens a project with one existing site.

Normal API responses take 150 ms. In the git and catalog profiles, only the specified endpoint takes 1,200 ms. Playwright intercepts requests, disabling the browser HTTP cache. The query cache is warm within each journey. Final comparisons alternate build order between rounds. A recorded run is separate from the timed sample. Live results are six fresh Chromium contexts per build against the same empty Cloud project with read-only API requests. Ports 4391 and 4393 identify the released and candidate builds in the live CSV. Live timings include the actual API and network latency.

The intermediate experiment removed first-site quick starts from the list loader but still awaited the catalog in the wizard loader. Its immediate-click measurements use the same fixture with the Create button and gallery heading as visible milestones.
