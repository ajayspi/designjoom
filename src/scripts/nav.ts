// Nav chrome: sticky-header state + side-nav active-section tracking.
// Both are pure DOM writes — no framework, no state library.
import { onReady } from "./dom";

onReady(() => {
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 50);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  const sidenav = document.querySelector<HTMLElement>("[data-sidenav]");
  if (!sidenav) return;

  const buttons = [...sidenav.querySelectorAll<HTMLButtonElement>(".sidenav-btn")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setActive = (id: string) =>
    buttons.forEach((b) => b.toggleAttribute("data-active", b.dataset.target === id));

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
    },
    { threshold: 0.35 },
  );
  for (const b of buttons) {
    const el = document.getElementById(b.dataset.target!);
    if (el) io.observe(el);
  }
  setActive("hero");

  for (const b of buttons) {
    b.addEventListener("click", () => {
      document.getElementById(b.dataset.target!)?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    });
  }
});
