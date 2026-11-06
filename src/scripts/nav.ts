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

  // Theme toggle. The initial value is applied by the inline script in Base.astro's
  // <head> (before first paint); this only handles switching and reflecting state.
  const toggle = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (toggle) {
    const root = document.documentElement;
    const sync = () => {
      const light = root.dataset.theme === "light";
      toggle.dataset.mode = light ? "light" : "dark";
      toggle.setAttribute("aria-pressed", String(light));
      toggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (meta) meta.content = light ? "#f6f8fc" : "#050810";
    };
    sync();
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      try {
        localStorage.setItem("dj-theme", next);
      } catch {
        /* private mode — the choice just won't persist */
      }
      sync();
    });
  }

  // Mobile menu. Below md the desktop link list is hidden entirely, so this panel is
  // the only navigation available there.
  const menuBtn = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const panel = document.querySelector<HTMLElement>("[data-menu-panel]");
  if (menuBtn && panel) {
    const setOpen = (open: boolean) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      panel.hidden = !open;
    };
    menuBtn.addEventListener("click", () => setOpen(panel.hidden));
    panel.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).closest("a")) setOpen(false);
    });
    addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) {
        setOpen(false);
        menuBtn.focus();
      }
    });
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
