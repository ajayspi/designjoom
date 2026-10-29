// Screenshot capture via the Chrome DevTools Protocol. No dependencies — Node 22+ ships a
// global WebSocket, and Chrome is already installed, so this beats the `chrome --screenshot`
// CLI, which cannot click anything.
//
// Why this exists: `chrome --headless --screenshot` cannot dismiss a cookie consent dialog,
// and `--force-prefers-reduced-motion` (needed to stop entrance animations mid-flight)
// can make sites that gate hero content behind animation state render *blank*.
//
// Usage:
//   node scripts/capture.mjs <url> <out.png> [--settle 3000] [--click "Decline"] [--full]
//
//   --settle  ms to wait after load for fonts/images/animations
//   --click   repeatable; clicks the first element whose text matches (case-insensitive,
//             substring). Use for cookie banners. Prefer the refuse option -- these are
//             other people's sites and "nothing is tracked until you say yes".
//   --full    capture the full scrollable page instead of just the viewport

import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const [, , url, outPath, ...rest] = process.argv;
if (!url || !outPath) {
  console.error("usage: node scripts/capture.mjs <url> <out.png> [--settle ms] [--click text] [--full]");
  process.exit(2);
}
const flag = (name) => rest.includes(name);
const opt = (name, dflt) => {
  const i = rest.indexOf(name);
  return i === -1 ? dflt : rest[i + 1];
};
const settle = Number(opt("--settle", 3500));
const clicks = rest.reduce((acc, a, i) => (a === "--click" ? [...acc, rest[i + 1]] : acc), []);
const W = Number(opt("--width", 1280));
const H = Number(opt("--height", 800));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "capture-"));
const port = 9000 + Math.floor(Math.random() * 900);
const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  `--window-size=${W},${H}`,
  "about:blank",
], { stdio: "ignore" });

let ws;
let msgId = 0;
const pending = new Map();
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });

try {
  // wait for the debugging endpoint
  let version = null;
  for (let i = 0; i < 60 && !version; i++) {
    await sleep(250);
    try {
      version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    } catch { /* not up yet */ }
  }
  if (!version) throw new Error("Chrome debugging endpoint never came up");

  const { webSocketDebuggerUrl } = version;
  ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? reject(new Error(`${m.error.message}`)) : resolve(m.result);
    }
  };

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  // a real 1280x800 viewport regardless of the OS window
  await send("Emulation.setDeviceMetricsOverride",
    { width: W, height: H, deviceScaleFactor: 1, mobile: false }, sessionId);

  await send("Page.navigate", { url }, sessionId);
  // settle: wait for load, then for fonts, then a fixed window for late animation
  for (let i = 0; i < 80; i++) {
    const { result } = await send("Runtime.evaluate",
      { expression: "document.readyState", returnByValue: true }, sessionId);
    if (result.value === "complete") break;
    await sleep(150);
  }
  await send("Runtime.evaluate",
    { expression: "document.fonts ? document.fonts.ready.then(()=>0) : 0", awaitPromise: true }, sessionId);
  await sleep(settle);

  const report = [];
  for (const text of clicks) {
    const expr = `(() => {
      const wanted = ${JSON.stringify(text.toLowerCase())};
      const nodes = [...document.querySelectorAll('button,a[role=button],input[type=button],input[type=submit],.cookie button')];
      const hit = nodes.find(n => (n.innerText || n.value || '').trim().toLowerCase().includes(wanted));
      if (!hit) return 'not found: ' + ${JSON.stringify(text)};
      hit.click();
      return 'clicked: ' + (hit.innerText || hit.value || '').trim().slice(0, 40);
    })()`;
    const { result, exceptionDetails } = await send("Runtime.evaluate",
      { expression: expr, returnByValue: true }, sessionId);
    report.push(exceptionDetails ? `error on "${text}"` : result.value);
    await sleep(700);
  }

  // scroll through the page so lazy images and scroll-triggered content settle
  if (flag("--full")) {
    await send("Runtime.evaluate", {
      expression: `(async () => {
        const step = innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          scrollTo({ top: y, behavior: "instant" });
          await new Promise(r => setTimeout(r, 120));
        }
        scrollTo({ top: 0, behavior: "instant" });
      })()`,
      awaitPromise: true,
    }, sessionId);
    await sleep(600);
  }

  const shot = await send("Page.captureScreenshot",
    { format: "png", captureBeyondViewport: flag("--full") }, sessionId);
  writeFileSync(outPath, Buffer.from(shot.data, "base64"));

  const { result: diag } = await send("Runtime.evaluate", {
    expression: `JSON.stringify({ title: document.title, h: document.body.scrollHeight,
      imgs: [...document.images].filter(i => i.naturalWidth > 0).length + "/" + document.images.length,
      // complete && naturalWidth 0 == the browser failed to DECODE it. That is how a
      // git-CRLF-corrupted PNG presents, and it is invisible to an HTTP check that only
      // sees a 200 with image/png.
      broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0)
                 .map(i => (i.currentSrc || i.src || "?").split("/").pop()) })`,
    returnByValue: true,
  }, sessionId);
  const d = JSON.parse(diag.value);
  console.log(`${outPath}  ${report.length ? report.join(" | ") : ""}`);
  console.log(`  title="${d.title}" height=${d.h} images=${d.imgs} loaded`);
  if (d.broken.length) {
    console.error(`  BROKEN IMAGES (${d.broken.length}): ${d.broken.join(", ")}`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error("capture failed:", err.message);
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch { /* already closed */ }
  chrome.kill();
  await sleep(300);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* locked, ignore */ }
}
