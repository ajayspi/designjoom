// Parity harness — pins the behaviour the Astro migration must not break.
// Run: node scripts/parity.mjs [baseUrl]   (default http://localhost:4321)
// Exits non-zero on any failed assertion. No dependencies, no framework.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.argv[2] || "http://localhost:4321").replace(/\/$/, "");
const fails = [];
const ok = (cond, label) => { if (!cond) fails.push(label); };

// Hardcoded on purpose: an independent check, not a tautology against the build's own data.
const NAME = "A V Ajay Kiran";
const PROJECTS = ["IR4U", "Pro Studio X", "Vigilare", "Recytronics", "eRevival",
  "The Precious Jewels", "Aura Makeover", "Talenttrek", "Clipped AI Studio"];
const EMPLOYERS = ["DIGIT AI", "Vigilare Bio Pharma", "Logos GmbH", "Vedic IT Solutions"];
const LIVE_LINKS = ["https://www.recytronics.com", "https://ir4ubyram.com", "https://www.vigilarebp.com"];

const html = await (await fetch(BASE + "/")).text();
// Collapse tags + whitespace so split-across-elements text still matches ("A V Ajay<br>Kiran").
const text = html.replace(/<[^>]+>/g, " ").replace(/&#\d+;|&[a-z]+;/gi, " ").replace(/\s+/g, " ");

// ── identity ──────────────────────────────────────────────────────────────────
ok(text.includes(NAME), `hero/text contains the full name "${NAME}"`);
// "Av. Ajay" is allowed inside JSON-LD (it is an intentional alternateName for entity
// disambiguation) but must never be the displayed name anywhere.
const withoutSchema = html.replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/g, "");
ok(!/\bAv\. Ajay\b/i.test(withoutSchema), 'the "Av. Ajay" form is never displayed');
ok(!/Rosh/i.test(html), "the string 'Rosh' appears nowhere");

// ── content ───────────────────────────────────────────────────────────────────
for (const p of PROJECTS) ok(text.includes(p), `project present: ${p}`);
for (const e of EMPLOYERS) ok(text.includes(e), `employer present: ${e}`);
ok((html.match(/<h1[\s>]/g) || []).length === 1, "exactly one <h1>");

// ── verified links ────────────────────────────────────────────────────────────
for (const l of LIVE_LINKS) ok(html.includes(l), `verified link present: ${l}`);
ok(!html.includes('"https://recytronics.com"'), "dead bare-domain Recytronics URL is gone");

// ── accessibility features already paid for ───────────────────────────────────
ok(/aria-label="Go to [^"]+ section"/.test(html), "side-nav buttons keep aria-label");
ok(/<div[^>]+class="cursor[^"]*"[^>]+aria-hidden="true"/.test(html), "custom cursor keeps aria-hidden");
ok(/<canvas[^>]+id="neural-canvas"[^>]+aria-hidden="true"/.test(html), "neural canvas keeps aria-hidden");
ok(/role="img"[^>]+aria-label="[^"]{20,}"/.test(html), "charts keep role=img + text alternative");
ok(/aria-label="Open [^"]+ in a new tab"/.test(html), "project links keep per-card aria-label");
ok(/<a class="figma-bypass-link"[^>]*>Skip to content<\/a>/.test(html) || /Skip to content/.test(html),
  "skip link present");

// ── stylesheet ────────────────────────────────────────────────────────────────
const cssHref = (html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/) || [])[1];
if (!cssHref) {
  fails.push("a built stylesheet is linked");
} else {
  const css = await (await fetch(new URL(cssHref, BASE + "/"))).text();
  ok(css.includes("scroll-margin-top"), "anchored sections keep scroll-margin-top");
  ok(css.includes("prefers-reduced-motion"), "reduced-motion backstop kept");
  ok(css.includes("focus-visible"), "visible keyboard focus kept");
  ok(!css.includes("git-lfs"), "stylesheet is real CSS, not an LFS pointer");
}

// ── images: real binaries, not LFS pointers ───────────────────────────────────
const srcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
if (srcs.length < 12) fails.push(`expected >=12 images (photo, logos, 9 thumbnails), found ${srcs.length}`);
for (const src of [...new Set(srcs)]) {
  const res = await fetch(new URL(src, BASE + "/"));
  const buf = Buffer.from(await res.arrayBuffer());
  // Check magic bytes, not the extension: the invariant is "a real image", and the
  // thumbnails are webp while the photo and logos are png.
  const isPng = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e;
  const isWebp = buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP";
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  ok(isPng || isWebp || isJpeg, `image has real image bytes: ${src}`);
  ok(buf.length > 3_000, `image has real bytes (${buf.length}): ${src}`);
}

// ── dist sweep: no LFS pointers anywhere ──────────────────────────────────────
if (process.env.PARITY_DIST) {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  for (const f of walk(process.env.PARITY_DIST)) {
    const b = readFileSync(f);
    if (b.length < 4096 && b.includes(Buffer.from("git-lfs"))) fails.push(`LFS pointer shipped: ${f}`);
  }
}

// ── report ────────────────────────────────────────────────────────────────────
if (fails.length) {
  console.error(`PARITY FAIL (${fails.length})`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  // exitCode, not exit(): process.exit() with undici keep-alive sockets open trips a
  // libuv assertion on Windows that can mask the real exit status.
  process.exitCode = 1;
} else {
  console.log(`PARITY PASS — ${PROJECTS.length} projects, ${EMPLOYERS.length} employers, ${srcs.length} images`);
}
