// ponytail: one readiness guard for all page scripts. Astro hoists bundled <script> to
// <head>, so a module can execute before the components it queries exist in the DOM.
export const onReady = (fn: () => void) => {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
  else fn();
};
