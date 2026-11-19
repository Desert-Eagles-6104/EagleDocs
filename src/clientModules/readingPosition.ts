/* global window, document, performance */
import type { ClientModule } from "@docusaurus/types";

const prefix = "eagledocs:reading-position:v1:";
let activePath: string | null = null;
let saveTimer: number | undefined;
let restoreFrame: number | undefined;
let initialized = false;

function savePosition() {
  window.clearTimeout(saveTimer);
  if (!activePath || restoreFrame !== undefined) return;
  try {
    window.localStorage.setItem(prefix + activePath, String(window.scrollY));
  } catch {
    // Reading must still work when browser storage is unavailable or full.
  }
}

function cancelRestore() {
  if (restoreFrame !== undefined) window.cancelAnimationFrame(restoreFrame);
  restoreFrame = undefined;
}

function initialize() {
  if (initialized) return;
  initialized = true;
  window.history.scrollRestoration = "manual";
  window.addEventListener(
    "scroll",
    () => {
      if (!activePath || restoreFrame !== undefined) return;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(savePosition, 200);
    },
    { passive: true },
  );
  window.addEventListener("pagehide", savePosition);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") savePosition();
  });
  // Stop retrying if the student starts interacting while content loads.
  for (const event of ["wheel", "touchstart", "pointerdown", "keydown"]) {
    window.addEventListener(event, cancelRestore, { passive: true });
  }
}

const readingPosition: ClientModule = {
  onRouteUpdate({ location, previousLocation }) {
    initialize();
    if (previousLocation?.pathname === location.pathname) {
      if (previousLocation.hash !== location.hash) cancelRestore();
      return;
    }
    savePosition();
    cancelRestore();
    activePath = null;
  },
  onRouteDidUpdate({ location, previousLocation }) {
    if (previousLocation?.pathname === location.pathname) return;
    activePath = location.pathname;
    // Explicit links to headings take priority over a saved reading position.
    if (location.hash) return;
    let saved: string | null;
    try {
      saved = window.localStorage.getItem(prefix + activePath);
    } catch {
      return;
    }
    if (saved === null) return;
    const target = Number(saved);
    if (!Number.isFinite(target) || target < 0) return;
    const deadline = performance.now() + 2000;
    const restore = () => {
      window.scrollTo({ top: target, behavior: "instant" });
      // Lazy content may initially make the document shorter than its saved position.
      if (
        Math.abs(window.scrollY - target) > 1 &&
        performance.now() < deadline
      ) {
        restoreFrame = window.requestAnimationFrame(restore);
      } else {
        restoreFrame = undefined;
      }
    };
    restoreFrame = window.requestAnimationFrame(restore);
  },
};

export default readingPosition;
