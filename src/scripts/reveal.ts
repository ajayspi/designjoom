// Reveal on scroll — replaces framer-motion's Reveal wrapper.
//
// Safety contract (this is the whole point of the file):
//   content is hidden ONLY when we have already attached an observer to that element,
//   via [data-reveal-ready]. No JS, an early-running script, or a failed observer all
//   degrade to "no animation, content visible" — never to a blank page.
import { onReady } from "./dom";

onReady(() => {
  document.documentElement.classList.add("js");
  const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!items.length) return;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }

  let delivered = 0;
  const reveal = (el: HTMLElement) => {
    if (el.classList.contains("in")) return;
    el.style.transitionDelay = `${el.dataset.revealDelay || 0}ms`;
    el.classList.add("in");
  };

  const io = new IntersectionObserver(
    (entries) => {
      delivered += entries.length;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        reveal(e.target as HTMLElement);
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
  );

  for (const el of items) {
    io.observe(el);
    // Mark AFTER observing: the CSS hides only wired elements, so the window between
    // observing and the first paint can never leave content invisible.
    el.dataset.revealReady = "1";
  }

  // Safety net. Some environments never deliver IO callbacks at all (no compositing
  // frames — headless capture, a throttled background tab). If nothing has been
  // delivered after 3s the observer is inert, so reveal everything rather than ship a
  // page of invisible sections. In a healthy browser `delivered` is non-zero within one
  // frame, so this never fires and never short-circuits the scroll animation.
  setTimeout(() => {
    if (!delivered) items.forEach(reveal);
  }, 3000);
});
