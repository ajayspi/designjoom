// Hero role typewriter. The full word list ships in a data attribute and the FIRST role
// is rendered as real text in the HTML, so crawlers and no-JS visitors see a real role.
// Reduced motion gets that static text, never an empty span.
import { onReady } from "./dom";

onReady(() => {
  const el = document.querySelector<HTMLElement>("[data-typewriter]");
  if (!el) return;
  const words: string[] = JSON.parse(el.dataset.words || "[]");
  if (!words.length) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const out = el.querySelector<HTMLElement>(".tw-text");
  const caret = el.querySelector<HTMLElement>(".tw-caret");
  if (!out || !caret) return;

  let idx = 0, len = 0, deleting = false;
  const step = () => {
    const word = words[idx];
    len += deleting ? -1 : 1;
    out.textContent = word.slice(0, len);
    let delay = deleting ? 38 : 75;
    if (!deleting && len === word.length) { deleting = true; delay = 1800; }
    else if (deleting && len === 0) { deleting = false; idx = (idx + 1) % words.length; delay = 300; }
    setTimeout(step, delay);
  };
  setTimeout(step, 1200);
});
