/** dis-brand-agent repo=PLUS ONE product=DIS BRAND tag=DIS-PLUSONE-ALEFBA-WORKSPACE-PUBLIC-SITE-JS name="DIS BRAND Governed Agent" action=edit at=2026-08-09T20:27:39.979Z */
/** Shared site utilities — UTM, analytics, charter bar, subpage boot */

export function captureUtm() {
  const params = new URLSearchParams(location.search);
  const ref = params.get("ref") || params.get("utm_source");
  if (ref) {
    try {
      localStorage.setItem("alefba-ref", ref.slice(0, 64));
    } catch {
      /* ignore */
    }
  }
  return localStorage.getItem("alefba-ref") || "";
}

export function trackPageView(page) {
  const ref = captureUtm();
  const payload = { page, ref, at: new Date().toISOString() };
  try {
    const key = "alefba-views";
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    prev.push(payload);
    localStorage.setItem(key, JSON.stringify(prev.slice(-50)));
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("alefba:view", { detail: payload }));
  }
}

export function initCharterBar() {
  const bar = document.getElementById("charter-bar");
  if (!bar) return;
  const show = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    bar.classList.toggle("is-visible", y > 280);
  };
  window.addEventListener("scroll", show, { passive: true });
  show();
}

export function initSubpageLang(langBtnId, applyFn) {
  const btn = document.getElementById(langBtnId || "lang-btn");
  if (!btn || !applyFn) return;
  btn.addEventListener("click", () => {
    const cur = document.documentElement.dataset.lang || "fa";
    applyFn(cur === "en" ? "fa" : "en");
  });
}

export async function loadReceipts() {
  const res = await fetch("/api/receipts");
  if (!res.ok) throw new Error("receipts_unavailable");
  return res.json();
}
