// AEO/SEO/GEO assertions against the built output.
// Run: pnpm build && node scripts/verify.mjs      (or: node scripts/verify.mjs <url>)
// Exits non-zero on failure. Hardcoded expectations — an independent check, not a
// tautology against the same data the build read.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const arg = process.argv[2];
let html, readAsset;

if (arg && /^https?:\/\//.test(arg)) {
  const base = arg.replace(/\/$/, "");
  html = await (await fetch(base + "/")).text();
  readAsset = async (rel) => {
    const res = await fetch(new URL(rel, base + "/"));
    return Buffer.from(await res.arrayBuffer());
  };
} else {
  const DIST = join(process.cwd(), "dist");
  html = readFileSync(join(DIST, "index.html"), "utf8");
  readAsset = (rel) => readFileSync(join(DIST, rel.replace(/^\//, "")));
}

const fails = [];
const ok = (cond, label) => { if (!cond) fails.push(label); };

const NAME = "A V Ajay Kiran";
const PROJECTS = ["IR4U", "Pro Studio X", "Vigilare", "Recytronics", "eRevival",
  "The Precious Jewels", "Aura Makeover", "Talenttrek", "Clipped AI Studio"];
const EMPLOYERS = ["DIGIT AI", "Vigilare Bio Pharma", "Logos GmbH", "Vedic IT Solutions"];
const METRICS = ["+99% website traffic", "+93% new users", "1,400+ users",
  "180%+ organic traffic growth", "60,900+ video views", "33,248 impressions across 48 posts",
  "2,534 new users"];

const text = html.replace(/<[^>]+>/g, " ").replace(/&#\d+;|&[a-z]+;/gi, " ").replace(/\s+/g, " ");

// ── document ──────────────────────────────────────────────────────────────────
// Decode entities before measuring: Astro escapes "&" to "&amp;", and a title limit is
// about what a browser (and a search result) renders, not about raw source bytes.
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/gi, "'");

// recursive file walk, used for both the thumbnail and LFS-pointer sweeps
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);

ok(/<html lang="en"/.test(html), '<html lang="en">');
const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || "");
ok(title.includes(NAME), "title contains the name");
ok(title.length > 0 && title.length <= 60, `title <= 60 chars (is ${title.length})`);

const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "");
ok(desc.length >= 120 && desc.length <= 158, `description 120-158 chars (is ${desc.length})`);
ok(desc.includes(NAME), "description contains the name");

ok(/<link rel="canonical" href="https:\/\/www\.designjoom\.com\/"/.test(html), "canonical is the primary URL");

// ── social ────────────────────────────────────────────────────────────────────
for (const [attr, val] of [
  ["og:title", title], ["og:description", desc], ["og:type", null],
  ["og:url", "https://www.designjoom.com/"], ["og:site_name", null],
  ["og:image", null], ["og:image:width", "1200"], ["og:image:height", "630"],
]) {
  const m = html.match(new RegExp(`property="${attr}" content="([^"]*)"`));
  ok(!!m, `${attr} present`);
  // decode: attributes are HTML-escaped, so "&" arrives as "&amp;" and would never equal
  // the decoded <title>. Compare what a scraper actually parses.
  if (m && val) ok(decode(m[1]) === val, `${attr} matches the canonical value`);
}
ok(/name="twitter:card" content="summary_large_image"/.test(html), "twitter:card=summary_large_image");
const ogImage = (html.match(/property="og:image" content="([^"]*)"/) || [])[1] || "";
ok(ogImage.startsWith("https://"), "og:image is an absolute URL");

// ── crawler-visible content ───────────────────────────────────────────────────
ok((html.match(/<h1[\s>]/g) || []).length === 1, "exactly one <h1>");
const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "";
ok(h1.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").includes(NAME), "h1 contains the full name");
for (const p of PROJECTS) ok(text.includes(p), `raw HTML contains project: ${p}`);
for (const e of EMPLOYERS) ok(text.includes(e), `raw HTML contains employer: ${e}`);
for (const m of METRICS) ok(text.includes(m), `raw HTML contains metric: ${m}`);
ok(html.includes("<table"), "results table present");
ok((html.match(/<tr[\s>]/g) || []).length >= 8, "results table has a header + 7 rows");

// ── structured data ───────────────────────────────────────────────────────────
const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
ok(blocks.length === 4, `4 JSON-LD blocks (found ${blocks.length})`);
const nodes = blocks.map((b) => { try { return JSON.parse(b); } catch { fails.push("a JSON-LD block does not parse"); return null; } });
const person = nodes.find((n) => n && n["@type"] === "Person");
ok(!!person, "Person node present");
if (person) {
  ok(person.name === NAME, "Person.name is the canonical name");
  ok(Array.isArray(person.alternateName) && person.alternateName.length >= 2, "Person.alternateName has the disambiguation list");
  ok(Array.isArray(person.sameAs) && person.sameAs.length === 3, "Person.sameAs has 3 profiles");
  ok(!!person.worksFor?.name, "Person.worksFor names the employer");
  ok(Array.isArray(person.knowsAbout) && person.knowsAbout.length > 20, "Person.knowsAbout lists the skills");
}
const faq = nodes.find((n) => n && n["@type"] === "FAQPage");
ok(!!faq, "FAQPage node present");
ok(faq?.mainEntity?.length === 8, `FAQPage has 8 questions (found ${faq?.mainEntity?.length})`);
ok(!!nodes.find((n) => n && n["@type"] === "WebSite"), "WebSite node present");
ok(!!nodes.find((n) => n && n["@type"] === "ProfilePage"), "ProfilePage node present");

// ── assets ────────────────────────────────────────────────────────────────────
if (!arg) {
  const robots = readFileSync(join("dist", "robots.txt"), "utf8");
  ok(robots.includes("Sitemap:"), "robots.txt declares a sitemap");
  ok(/GPTBot/.test(robots) && /ClaudeBot/.test(robots), "robots.txt explicitly allows AI crawlers");
  ok(!/Disallow: \//.test(robots), "robots.txt does not block the site");

  const llms = readFileSync(join("dist", "llms.txt"), "utf8");
  ok(llms.includes(NAME), "llms.txt contains the name");

  const sitemapFiles = readdirSync("dist").filter((f) => f.startsWith("sitemap"));
  ok(sitemapFiles.length > 0, "a sitemap was generated");

  const ogPath = join("dist", "og-image.jpg");
  if (!existsSync(ogPath)) {
    fails.push("public/og-image.jpg exists (1200x630)");
  } else {
    const img = readFileSync(ogPath);
    // JPEG SOI marker + parse the SOF0 frame header for real dimensions.
    ok(img[0] === 0xff && img[1] === 0xd8, "og-image is a real JPEG");
    let w = 0, h = 0;
    for (let i = 2; i < img.length - 9;) {
      if (img[i] !== 0xff) { i++; continue; }
      const marker = img[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        h = img.readUInt16BE(i + 5); w = img.readUInt16BE(i + 7); break;
      }
      i += 2 + img.readUInt16BE(i + 2);
    }
    ok(w === 1200 && h === 630, `og-image is 1200x630 (is ${w}x${h})`);
  }

  // LFS pointers shipped as content — the bug that previously wiped the hero photo.
  for (const f of walk(join(process.cwd(), "dist"))) {
    const b = readFileSync(f);
    if (b.length < 4096 && b.includes(Buffer.from("git-lfs"))) fails.push(`LFS pointer shipped: ${f}`);
  }
}

// ── verification tags must be absent unless configured ────────────────────────
ok(!/google-site-verification/.test(html) || /google-site-verification" content="[^"]+"/.test(html),
  "google-site-verification is never emitted empty");
ok(!/msvalidate/.test(html) || /msvalidate.01" content="[^"]+"/.test(html),
  "msvalidate.01 is never emitted empty");

// ── project screenshots ───────────────────────────────────────────────────────
// A card with a typo'd image slug must fail the build (Projects.astro throws), and an
// LFS pointer or a stock image standing in for real work must never reach dist/.
// Vite hashes and flattens asset paths, so match the hashed name and recover the slug
// from it rather than assuming the source directory survives into dist/.
const shots = [...html.matchAll(/<img[^>]+src="\/_astro\/([a-z0-9-]+)\.[A-Za-z0-9_-]+\.webp"[^>]*>/g)];
ok(shots.length === 9, `9 project thumbnails rendered (found ${shots.length})`);
for (const m of shots) {
  const slug = m[1];
  ok(/loading="lazy"/.test(m[0]), `thumbnail is lazy-loaded: ${slug}`);
  ok(/decoding="async"/.test(m[0]), `thumbnail has decoding=async: ${slug}`);
  ok(/width="\d+"[^>]*height="\d+"/.test(m[0]) || /height="\d+"[^>]*width="\d+"/.test(m[0]),
    `thumbnail has explicit dimensions (no CLS): ${slug}`);
}
const webps = new Set(shots.map((m) => m[1]));
ok(webps.size === 9, `9 distinct thumbnails (found ${webps.size})`);

if (!arg) {
  // normalize Windows separators so the pattern below is not platform-dependent
  const shipped = walk(join(process.cwd(), "dist")).map((f) => f.replace(/\\/g, "/"));
  for (const slug of webps) {
    // dist filenames are content-hashed: <slug>.<hash>.webp
    const file = shipped.find((f) => new RegExp(`/${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.[A-Za-z0-9_-]+\\.webp$`).test(f));
    if (!file) { fails.push(`thumbnail shipped: ${slug}.webp`); continue; }
    const buf = readFileSync(file);
    ok(buf.length > 3000, `thumbnail has real bytes (${buf.length}): ${slug}.webp`);
    // RIFF....WEBP magic — catches a renamed PNG and any LFS pointer.
    ok(buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP",
      `thumbnail is real webp: ${slug}.webp`);
  }
}

// ── source image integrity ────────────────────────────────────────────────────
// A `text` attribute in .gitattributes makes git normalise CRLF<->LF, which rewrites
// bytes inside a PNG/JPEG/WebP. The file still serves 200 with the right content-type,
// so every HTTP-level check passes, and the browser just shows a broken image. This
// compares each working-tree image against its committed blob, then structurally
// validates it. It is the check that would have caught the hero photo and five project
// thumbnails being silently corrupted on checkout.
if (!arg) {
  const imgs = [];
  const collect = (dir) => {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) collect(p);
      else if (/\.(png|jpe?g|webp)$/i.test(e.name)) imgs.push(p);
    }
  };
  collect(join(process.cwd(), "public"));
  collect(join(process.cwd(), "src", "imports"));

  for (const p of imgs) {
    const rel = relative(process.cwd(), p).replace(/\\/g, "/");
    const disk = statSync(p);
    const b = readFileSync(p);

    // LFS-tracked files legitimately store a ~130-byte pointer in the index, so the
    // disk-vs-index size comparison only applies to files git stores raw.
    let filter = "";
    try {
      filter = execFileSync("git", ["check-attr", "filter", "--", rel],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split(/\s+/).pop();
    } catch { /* not a git repo — structural checks below still run */ }

    if (filter === "lfs") {
      ok(!rel.startsWith("src/imports/"),
        `image under src/imports/ must NOT be LFS-tracked: ${rel} — Vercel does not fetch ` +
        `LFS objects, so Astro receives a pointer and the build fails with [NoImageMetadata]`);
      let idxBlob = "";
      try {
        idxBlob = execFileSync("git", ["cat-file", "blob", `:${rel}`],
          { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      } catch { /* ignore */ }
      ok(idxBlob.startsWith("version https://git-lfs"),
        `LFS pointer intact in the index: ${rel}`);
      ok(!b.subarray(0, 60).toString().includes("git-lfs"),
        `working copy is smudged real bytes, not a pointer: ${rel}`);
    } else {
      let blob = null;
      try {
        // compare against the INDEX (":path"), not HEAD: this validates "what git is about
        // to store is byte-identical to the file on disk", which is the actual invariant.
        blob = Number(execFileSync("git", ["cat-file", "-s", `:${rel}`],
          { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim());
      } catch { /* untracked (e.g. a capture not yet staged) — structural check still runs */ }
      if (blob !== null) {
        ok(disk.size === blob,
          `image matches what git will store (no CRLF rewrite): ${rel} [disk ${disk.size} vs index ${blob}]`);
      }
    }

    if (/\.png$/i.test(rel)) {
      ok(b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
        `PNG signature intact: ${rel}`);
    } else if (/\.webp$/i.test(rel)) {
      ok(b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP",
        `WebP RIFF/WEBP header intact: ${rel}`);
      ok(b.length >= 8 && b.readUInt32LE(4) === b.length - 8,
        `WebP RIFF length matches file size: ${rel}`);
    } else {
      ok(b[0] === 0xff && b[1] === 0xd8, `JPEG SOI marker intact: ${rel}`);
      ok(b.length > 2 && b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9, `JPEG EOI marker intact: ${rel}`);
    }
  }
}

if (fails.length) {
  console.error(`VERIFY FAIL (${fails.length})`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  // exitCode, not exit(): process.exit() with undici keep-alive sockets open trips a
  // libuv assertion on Windows that can mask the real exit status.
  process.exitCode = 1;
} else {
  console.log("VERIFY PASS — head, social, schema, content and assets all present");
}
