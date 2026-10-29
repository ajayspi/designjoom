// Metric counters. The final formatted value is already in the element's text (so it is
// crawlable and readable without JS); the tween starts from 0 and lands back on it.
// Reduced motion skips straight to the static value.
import { onReady } from "./dom";

onReady(() => {
  const fmt = (n: number, decimals: number) =>
    decimals > 0 ? n.toFixed(decimals)
      : n >= 10000 ? `${(n / 1000).toFixed(0)}K`
      : n >= 1000 ? `${(n / 1000).toFixed(1)}K`
      : Math.floor(n).toString();

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  for (const el of document.querySelectorAll<HTMLElement>("[data-count]")) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? "";
    const decimals = Number(el.dataset.decimals ?? 0);
    const final = `${fmt(target, decimals)}${suffix}`;
    if (reduced || !Number.isFinite(target)) { el.textContent = final; continue; }

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.unobserve(el);
      const dur = 1400, t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${fmt(target * eased, decimals)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = final;
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
  }
});
