import type { Page, Route } from "@playwright/test";
import type { Models } from "@appwrite.io/console";
import { chromium } from "playwright";

const TEMPLATE_KEY = "starter-for-react";

const FRAMEWORK = {
  key: "react",
  name: "React",
  installCommand: "npm install",
  buildCommand: "npm run build",
  outputDirectory: "./dist",
  providerRootDirectory: "./",
  buildRuntime: "node-22",
  adapter: "static",
  fallbackFile: "index.html",
} satisfies Models.TemplateFramework;

function template(scopes: string[]): Models.TemplateSite {
  return {
    key: TEMPLATE_KEY,
    name: "React starter",
    tagline: "Simple React application integrated with Appwrite SDK.",
    demoUrl: "",
    screenshotDark: "",
    screenshotLight: "",
    useCases: ["starter"],
    frameworks: [FRAMEWORK],
    vcsProvider: "github",
    providerRepositoryId: "starter-for-react",
    providerOwner: "appwrite",
    providerVersion: "0.1.*",
    variables: [],
    scopes,
  };
}

const NOW = "2026-09-09T09:30:00.000+00:00";

// The scenario is an owner with every console permission and every service
// on, so nothing about navigation or gating stands between the specs and the
// two pages they open. Spelled out here rather than imported, so a change to
// the console's defaults shows up as a failure instead of rewriting the mock.
const OWNER_ROLES = ["owner"] satisfies Models.Roles["roles"];
const OWNER_SCOPES = [
  "projects.read",
  "projects.write",
  "databases.read",
  "databases.write",
  "tables.write",
  "collections.write",
  "rows.write",
  "documents.write",
  "functions.read",
  "functions.write",
  "buckets.read",
  "buckets.write",
  "keys.write",
  "platforms.write",
  "webhooks.write",
  "users.write",
  "teams.read",
  "teams.write",
  "messages.read",
  "messages.write",
  "topics.write",
  "providers.write",
  "subscribers.write",
  "sites.read",
  "sites.write",
  "domains.write",
  "executions.write",
  "migrations.write",
  "vcs.write",
  "rules.write",
  "events.read",
  "billing.read",
] satisfies Models.Roles["scopes"];
const ALL_SERVICES = [
  "account",
  "avatars",
  "databases",
  "tablesdb",
  "locale",
  "health",
  "project",
  "storage",
  "teams",
  "users",
  "vcs",
  "sites",
  "functions",
  "proxy",
  "graphql",
  "migrations",
  "messaging",
  "advisor",
  "oauth2",
] as const;

const ACCOUNT = {
  $id: "user000000000000000001",
  $createdAt: NOW,
  $updatedAt: NOW,
  name: "Demo Operator",
  registration: NOW,
  status: true,
  labels: [],
  passwordUpdate: NOW,
  email: "demo@example.com",
  phone: "",
  emailVerification: true,
  phoneVerification: false,
  mfa: false,
  prefs: { "console.dismissedBanners": "firewall-moved-2026-11" },
  targets: [],
  accessedAt: NOW,
} satisfies Partial<Models.User<Models.Preferences>>;

const RECIPIENT = {
  ...ACCOUNT,
  $id: "user000000000000000002",
  name: "Jordan Reader",
  email: "jordan@example.com",
};

const ORGANIZATION = {
  $id: "org00000000000000000001",
  $createdAt: NOW,
  $updatedAt: NOW,
  name: "Acme Docs",
  billingPlan: "tier-0",
  billingEmail: ACCOUNT.email,
  status: "active",
} satisfies Partial<Models.Organization<Models.Preferences>>;

const PROJECT = {
  $id: "proj0000000000000000001",
  $createdAt: NOW,
  $updatedAt: NOW,
  name: "Acme Docs",
  teamId: ORGANIZATION.$id,
  region: "default",
  status: "active",
  // The SDK types service ids as an enum, so the literals need the cast.
  services: ALL_SERVICES.map(($id) => ({
    $id,
    enabled: true,
  })) as Models.Project["services"],
} satisfies Partial<Models.Project>;

const TARGET = {
  $id: "target00000000000000001",
  $createdAt: NOW,
  $updatedAt: NOW,
  name: "",
  userId: RECIPIENT.$id,
  providerId: "",
  providerType: "email",
  identifier: RECIPIENT.email,
  expired: false,
} satisfies Models.Target;

const MESSAGE_ID = "msg00000000000000000001";

const TEMPLATE_HTML = `<!doctype html>
<html>
  <body style="font-family:Arial,sans-serif;">
    <p>Hello {{user}},</p>
    <p>Sign in to your {{b}}{{project}}{{/b}} account.</p>
    <p><a href="{{redirect}}">Verify email</a></p>
  </body>
</html>`;

const EMAIL_HTML = `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7fb;font-family:Arial,sans-serif;">
    <p>Hi Jordan,</p>
    <p>These files in your workspace will be deleted in less than two days.</p>
    <p><a href="https://example.com/workspace/">Open my workspace</a></p>
  </body>
</html>`;

const HOSTILE_HTML = `<!doctype html>
<html>
  <body>
    <script>
      window.parent.document.body.setAttribute('data-escaped', 'script')
    </script>
    <img src="broken.png" onerror="window.top.document.body.setAttribute('data-escaped', 'onerror')">
    <a id="popup" href="https://example.com/popup" target="_blank">popup</a>
    <a id="top" href="https://example.com/top" target="_top">top</a>
    <form id="form" action="https://example.com/steal" method="post">
      <button id="submit" type="submit">submit</button>
    </form>
    <p id="marker">hostile body rendered</p>
  </body>
</html>`;

function emailMessage(
  status: "draft" | "sent",
  content: string = EMAIL_HTML,
): Models.Message {
  return {
    $id: MESSAGE_ID,
    $createdAt: NOW,
    $updatedAt: NOW,
    providerType: "email",
    topics: [],
    users: [],
    targets: [TARGET.$id],
    deliveredAt: status === "sent" ? NOW : undefined,
    deliveryErrors: [],
    deliveredTotal: status === "sent" ? 1 : 0,
    data: {
      subject: "Your Acme Docs files expire in two days",
      content,
      html: true,
    },
    status,
  } as Models.Message;
}

function corsHeaders(route: Route): Record<string, string> {
  const request = route.request();
  const origin = request.headers()["origin"] ?? "http://localhost:4173";
  const requested = request.headers()["access-control-request-headers"];
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers":
      requested ?? "content-type,x-appwrite-project,x-appwrite-response-format",
    "access-control-expose-headers": "x-appwrite-session",
  };
}

/** Every `/v1` call, on any region host, is answered here; the app itself is served live. */
async function mockAppwriteApi(
  page: Page,
  message: Models.Message,
  options: { smtpEnabled?: boolean } = {},
) {
  const localOrigin = BASE;

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const apiPath = url.pathname.match(/^\/v1(\/.*)$/)?.[1];
    if (url.origin === localOrigin && !apiPath) return route.continue();

    const headers = corsHeaders(route);
    if (!apiPath || request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers });
    }
    await new Promise((resolve) =>
      setTimeout(resolve, slow && apiPath === slowPath ? 1200 : 150),
    );
    if (apiPath === "/organizations/" + ORGANIZATION.$id + "/plan")
      return route.fulfill({
        json: { $id: "tier-0", name: "Free", order: 0, users: 75000 },
        headers,
      });
    if (apiPath.endsWith("/invoices"))
      return route.fulfill({ json: { total: 0, invoices: [] }, headers });
    if (apiPath === "/project/policies")
      return route.fulfill({ json: { total: 0, policies: [] }, headers });
    if (apiPath === "/project/oauth2")
      return route.fulfill({ json: { total: 0, providers: [] }, headers });
    if (
      apiPath === "/teams" &&
      request.headers()["x-appwrite-project"] === PROJECT.$id
    )
      return route.fulfill({ json: { total: 0, teams: [] }, headers });
    const json = (status: number, body: unknown) =>
      route.fulfill({
        status,
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify(body),
      });

    if (apiPath === "/sites")
      return json(
        200,
        process.argv.includes("populated")
          ? {
              total: 1,
              sites: [
                {
                  $id: "demo-site",
                  $createdAt: NOW,
                  $updatedAt: NOW,
                  name: "Existing demo site",
                  framework: "react",
                  enabled: true,
                  providerType: "",
                  deploymentId: "",
                  deploymentStatus: "",
                  latestDeploymentStatus: "",
                  domains: [],
                },
              ],
            }
          : { total: 0, sites: [] },
      );
    if (apiPath === "/sites/templates")
      return json(200, { total: 1, templates: [template([])] });
    if (apiPath === "/sites/templates/" + TEMPLATE_KEY)
      return json(200, template([]));
    if (apiPath === "/sites/frameworks")
      return json(200, { total: 1, frameworks: [FRAMEWORK] });
    if (apiPath === "/vcs/installations")
      return json(200, { total: 0, installations: [] });
    if (apiPath === "/project/keys")
      return json(200, {
        total: 1,
        keys: [
          {
            $id: "example",
            $createdAt: NOW,
            name: "Demo server key",
            scopes: [],
          },
        ],
      });
    if (apiPath === "/account/consents")
      return json(200, { total: 0, consents: [] });
    if (apiPath === "/messaging/messages")
      return json(200, { total: 1, messages: [message] });
    if (apiPath === "/messaging/providers")
      return json(200, {
        total: 1,
        providers: [
          {
            $id: "smtp-demo",
            $createdAt: NOW,
            name: "Demo provider",
            type: "email",
            provider: "smtp",
            enabled: true,
          },
        ],
      });
    if (apiPath === "/messaging/topics")
      return json(200, {
        total: 1,
        topics: [{ $id: "topic-demo", $createdAt: NOW, name: "Demo topic" }],
      });
    if (apiPath === "/account") return json(200, ACCOUNT);
    // GET returns the prefs, PATCH the updated user.
    if (apiPath === "/account/prefs") {
      return request.method() === "PATCH"
        ? json(200, { ...ACCOUNT, prefs: request.postDataJSON().prefs })
        : json(200, {});
    }
    if (apiPath === "/account/sessions")
      return json(200, { total: 0, sessions: [] });
    if (apiPath === "/health/version") return json(200, { version: "1.8.0" });
    if (apiPath === "/locale")
      return json(200, {
        ip: "203.0.113.10",
        countryCode: "DE",
        country: "Germany",
        continentCode: "EU",
        continent: "Europe",
        eu: true,
        currency: "EUR",
      });
    if (apiPath === "/console/variables")
      return json(200, { _APP_VCS_PROVIDERS: ["github"] });
    if (
      apiPath === "/console/scopes/project" ||
      apiPath === `/organizations/${ORGANIZATION.$id}/roles`
    )
      return json(200, { roles: OWNER_ROLES, scopes: OWNER_SCOPES });
    if (apiPath === "/organizations" || apiPath === "/teams")
      return json(200, { total: 1, teams: [ORGANIZATION] });
    if (
      apiPath === `/organizations/${ORGANIZATION.$id}` ||
      apiPath === `/teams/${ORGANIZATION.$id}`
    )
      return json(200, ORGANIZATION);
    if (apiPath.endsWith("/memberships"))
      return json(200, { total: 0, memberships: [] });
    if (apiPath === "/projects" || apiPath === "/organization/projects")
      return json(200, { total: 1, projects: [PROJECT] });
    if (
      apiPath === "/project" ||
      apiPath === `/projects/${PROJECT.$id}` ||
      apiPath === `/projects/${PROJECT.$id}/console-access`
    )
      return json(200, {
        ...PROJECT,
        smtpEnabled: options.smtpEnabled ?? false,
      });
    if (apiPath === "/locale/codes")
      return json(200, { total: 0, localeCodes: [] });
    if (apiPath.startsWith("/project/templates/email/"))
      return json(200, {
        type: apiPath.split("/").pop(),
        locale: "en",
        message: TEMPLATE_HTML,
        senderName: "Acme Docs",
        senderEmail: "noreply@acme.example",
        replyTo: "",
        subject: "Verify your email",
      });
    if (apiPath === `/messaging/messages/${MESSAGE_ID}`)
      return json(200, message);
    if (apiPath === `/messaging/messages/${MESSAGE_ID}/targets`)
      return json(200, { total: 1, targets: [TARGET] });
    if (apiPath === "/messaging/topics")
      return json(200, { total: 0, topics: [] });
    if (apiPath === "/storage/buckets")
      return json(200, { total: 0, buckets: [] });
    if (apiPath === "/users")
      return json(200, { total: 1, users: [RECIPIENT] });
    if (apiPath === `/users/${RECIPIENT.$id}`) return json(200, RECIPIENT);

    return json(404, {
      message: "Not found",
      code: 404,
      type: "general_route_not_found",
      version: "1.0",
    });
  });
}

const BASE = "http://localhost:" + process.argv[2];
const label = process.argv[3];
const profile = process.argv[4];
const slowPath = {
  catalog: "/sites/templates",
  git: "/vcs/installations",
  framework: "/sites/frameworks",
}[profile];
const slow = !!slowPath;
const video = process.argv.includes("video");
const browser = await chromium.launch();
try {
  for (let i = 0; i < Number(process.argv[5] || 1); i++) {
    const ctx = await browser.newContext({
      baseURL: BASE,
      viewport: { width: 1440, height: 900 },
      recordVideo: video
        ? { dir: ".", size: { width: 1440, height: 900 } }
        : undefined,
    });
    const page = await ctx.newPage();
    const videoStart = Date.now();
    page.on("pageerror", (e) => console.error("pageerror", e.message));
    await mockAppwriteApi(page, emailMessage("sent"));
    await page.addInitScript(() => {
      if (window.top !== window) return;
      localStorage.setItem(
        "debug:consoleProfile",
        JSON.stringify({ id: "cloud", features: {} }),
      );
      document.addEventListener(
        "click",
        () => (window.navClick = performance.now()),
        true,
      );
    });
    const prefix = "/projects/" + PROJECT.$id;
    await page.goto(prefix + "/auth/users");
    await page
      .getByRole("link", { name: /Jordan Reader/ })
      .or(page.getByText("Jordan Reader", { exact: true }))
      .first()
      .waitFor();
    await page.locator("[data-fullscreen-loader]").waitFor({ state: "hidden" });
    await page.waitForTimeout(500);
    const sites = page
      .locator('a[href="' + prefix + '/sites"]:visible')
      .first();
    const create = page
      .getByRole("button", { name: "Create site", exact: true })
      .last();
    const heading = page.getByRole("heading", {
      name: "Create your first site",
    });
    const card = page.getByText("React starter", { exact: true }).first();
    if (process.argv.includes("populated")) {
      let ancillary = 0;
      page.on("request", (r) => {
        if (
          r.method() === "GET" &&
          ["/v1/sites/templates", "/v1/vcs/installations"].includes(
            new URL(r.url()).pathname,
          )
        )
          ancillary++;
      });
      await sites.click();
      await page
        .getByText("Existing demo site", { exact: true })
        .first()
        .waitFor({ timeout: 6000 });
      const ms = await page.evaluate(
        () =>
          new Promise((r) =>
            requestAnimationFrame(() =>
              requestAnimationFrame(() =>
                r(Math.round(performance.now() - window.navClick)),
              ),
            ),
          ),
      );
      console.log(
        JSON.stringify({
          label,
          profile,
          i,
          name: "Populated Sites",
          ms,
          ancillary,
        }),
      );
      await ctx.close();
      continue;
    }
    for (const [name, click, ready] of [
      ["Sites", sites, create],
      ["Gallery", create, page.getByText("Clone template", { exact: true })],
      [
        "Configuration",
        card,
        page.getByRole("heading", { name: "Details", exact: true }),
      ],
      [
        "Gallery return",
        null,
        page.getByText("Clone template", { exact: true }),
      ],
      ["Sites return", null, create],
    ]) {
      if (video && name === "Sites")
        await click.evaluate((el) =>
          el.addEventListener(
            "click",
            () => {
              const sync = document.createElement("div");
              sync.style.cssText =
                "position:fixed;top:0;left:0;background:#00ff00;width:12px;height:12px;z-index:2147483647";
              document.body.append(sync);
            },
            { once: true },
          ),
        );
      if (click) await click.click({ timeout: 7000 });
      else {
        await page.evaluate(() => {
          window.navClick = performance.now();
          history.back();
        });
      }
      await ready.waitFor({ timeout: 10000 });
      if (name.startsWith("Sites")) {
        await heading.waitFor();
        if (!(await create.isEnabled()))
          throw Error("Create site action disabled");
      }
      await page
        .locator("[data-fullscreen-loader]")
        .waitFor({ state: "hidden" });
      const paint = () =>
        page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() =>
                  resolve(Math.round(performance.now() - window.navClick)),
                ),
              ),
            ),
        );
      const ms = await paint();
      const immediate = process.argv.includes("immediate");
      const [templateMs, gitMs] = await Promise.all([
        name !== "Configuration" && !(immediate && name === "Sites")
          ? card.waitFor({ timeout: 6000 }).then(paint)
          : null,
        name.startsWith("Sites") && !(immediate && name === "Sites")
          ? page
              .getByRole("link", { name: "Connect GitHub", exact: true })
              .waitFor({ timeout: 6000 })
              .then(paint)
          : null,
      ]);
      console.log(
        JSON.stringify({
          label,
          profile,
          immediate,
          i,
          name,
          ms,
          templateMs,
          gitMs,
        }),
      );
      if (video) await page.waitForTimeout(850);
    }
    await ctx.close();
    if (video) await page.video().saveAs(label + ".webm");
  }
} finally {
  await browser.close();
}
