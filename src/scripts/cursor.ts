// Custom cursor follower — fine-pointer enhancement only.
// Touch, keyboard and reduced-motion users keep the native cursor (the markup in
// Base.astro stays in the DOM but is inert: no JS positions it, so it never appears).
import { onReady } from "./dom";

onReady(() => {
  const dot = document.querySelector<HTMLElement>(".cursor");
  const ring = document.querySelector<HTMLElement>(".cursor-follower");
  if (!dot || !ring) return;
  if (!matchMedia("(pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let rx = 0, ry = 0, ax = 0, ay = 0, raf = 0;
  addEventListener("mousemove", (e) => {
    ax = e.clientX; ay = e.clientY;
    dot.style.left = `${ax}px`;
    dot.style.top = `${ay}px`;
  }, { passive: true });
  const tick = () => {
    rx += (ax - rx) * 0.13;
    ry += (ay - ry) * 0.13;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
});
