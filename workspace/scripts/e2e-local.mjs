#!/usr/bin/env node
/** dis-brand-agent repo=PLUS ONE product=DIS BRAND tag=DIS-PLUSONE-ALEFBA-WORKSPACE-SCRIPTS-E2E-LOCAL-MJS name="DIS BRAND Governed Agent" action=edit at=2026-08-09T20:43:48.821Z */
/**
 * Alefbâ local E2E prove — loopback :5293 only.
 * <!-- dis-brand-agent: repo=PLUS ONE product=DIS BRAND tag=DIS-PLUSONE-ALEFBA-E2E-LOCAL-MJS name="DIS BRAND Governed Agent" action=create at=2026-08-09T20:25:00.000Z file=ALEFBA/workspace/scripts/e2e-local.mjs -->
 */
const BASE = process.env.ALEFBA_BASE || "http://127.0.0.1:5293";

const checks = [];
function record(name, ok, detail = "") {
  checks.push({ name, ok: Boolean(ok), detail: String(detail || "") });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { res, buf, text: buf.toString("utf8") };
}

async function main() {
  console.log(`Alefbâ E2E → ${BASE}\n`);

  const paths = [
    "/api/health",
    "/",
    "/white-paper.html",
    "/receipts.html",
    "/corpus.html",
    "/press.html",
    "/data-room.html",
    "/app.js",
    "/app.css",
    "/persian-human.css",
    "/tokens.css",
    "/components.css",
    "/pages.js",
    "/white-paper.js",
    "/white-paper.css",
    "/og-share.svg",
    "/og-receipts.svg",
    "/og-corpus.svg",
    "/og-society.svg",
    "/og-pattern.svg",
    "/og-paper.svg",
    "/favicon.svg",
    "/api/tokenizer-v1-spec",
    "/api/eval-baselines",
    "/api/eval-harness",
    "/api/g1-report",
    "/api.html",
    "/api/v1/health",
    "/api/v1/status",
    "/api/g1-hf-baseline-report",
    "/api/g1-tokenizer-receipt",
    "/api/corpus-inventory",
  ];
  for (const p of paths) {
    const { res, buf } = await get(p);
    record(`${p} 200`, res.ok && res.status === 200, `${res.status} ${buf.length}b`);
  }

  const home = await get("/");
  const wp = await get("/white-paper.html");
  const appJs = await get("/app.js");
  const wpJs = await get("/white-paper.js");
  const og = await get("/og-share.svg");
  const css = await get("/white-paper.css");

  record("home has menu + panel", home.text.includes("menu-btn") && home.text.includes("nav-panel"));
  record("wp has menu + panel", wp.text.includes("menu-btn") && wp.text.includes("nav-panel"));
  record("home sample tabpanel", home.text.includes('role="tabpanel"') && home.text.includes('aria-controls="sample-out"'));
  record("home #pattern + bilingual nav", home.text.includes('id="pattern"') && home.text.includes('href="#pattern"'));
  record("home products + charter bar", home.text.includes('id="products"') && home.text.includes('id="charter-bar"'));
  record("home four-door package", home.text.includes('id="audiences"') && home.text.includes("audience-grid"));
  record("home society roster", home.text.includes("society-roster") && home.text.includes("society-role"));
  record("home founding wall live", home.text.includes("supporter-wall") && home.text.includes("aria-live=\"polite\""));
  record("home wall lane labels", appJs.text.includes("wall.laneParticipate") && appJs.text.includes("wall.laneInvest"));
  record("home receipts link", home.text.includes("/receipts.html") && home.text.includes("nav-panel"));
  record("home masters section", home.text.includes('id="masters"') && home.text.includes("masters.rumiT"));
  record("home literature refs", home.text.includes('id="literature"') && home.text.includes("science.refsTitle"));
  record("home persian UI linked", home.text.includes("persian-human.css"));
  record("home community spread", appJs.text.includes('"share.kicker": "Community spread"'));
  record("wp #pattern + bilingual table", wp.text.includes('id="pattern"') && wp.text.includes("wp-table-bilingual") && wp.text.includes("pat-en-line"));
  record("wp mobile TOC complete", ["#genesis", "#pattern", "#mix", "#gates", "#fail", "#glossary", "#cta"].every((a) => wp.text.includes(`href="${a}"`)));
  record("favicon linked both", home.text.includes("favicon.svg") && wp.text.includes("favicon.svg"));
  record("og:image both", home.text.includes("og-share.svg") && wp.text.includes("og-share.svg"));

  record("OG Alefbâ UTF-8", og.text.includes("Alefbâ") && og.text.includes("الفبا"));
  record("OG no mojibake", !og.text.includes("\uFFFD") && !og.text.includes("????"));

  record("sample dir from lang", appJs.text.includes('out.dir = lang === "fa" ? "rtl" : "ltr"'));
  record("reduced-motion gate", appJs.text.includes("prefersReducedMotion") && appJs.text.includes("prefers-reduced-motion"));
  record("EN epigraph SSOT", appJs.text.includes("Math guesses; books teach; time makes it smarter"));
  record("pattern bilingual i18n", wpJs.text.includes("pat-en-line") && wpJs.text.includes("Factory") && wpJs.text.includes("کارخانه"));
  record("EN line LTR polish CSS", css.text.includes("unicode-bidi: isolate") && css.text.includes(".pat-en-line"));

  const post = await fetch(`${BASE}/api/interest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E Polish",
      email: `e2e-polish-${Date.now()}@alefba.local`,
      lane: "invest",
      lang: "fa",
      showOnWall: true,
    }),
  });
  const pj = await post.json().catch(() => ({}));
  record("interest POST", post.ok && pj.ok === true, String(post.status));

  const stats = await get("/api/stats");
  let statsOk = false;
  try {
    const j = JSON.parse(stats.text);
    statsOk = typeof j === "object" && j !== null && Array.isArray(j.wall) && j.counts;
  } catch {
    statsOk = false;
  }
  record("stats JSON", stats.res.ok && statsOk);

  // Menu / lang behavior via static contract
  record("initMenu wired landing", appJs.text.includes("function initMenu") && appJs.text.includes("initMenu()"));
  record("initMenu wired white-paper", wpJs.text.includes("function initMenu") && wpJs.text.includes("initMenu()"));
  record("lang toggle refreshes sample", appJs.text.includes("showSample(key)") && appJs.text.includes("lang-btn"));
  record("flat i18n share.pitch access", appJs.text.includes('["share.pitch"]') && !appJs.text.includes(".share.pitch"));
  record("charter bar + utm wired", appJs.text.includes("initCharterBar") && appJs.text.includes("captureUtm"));

  const receipts = await get("/api/receipts");
  let receiptsOk = false;
  try {
    const rj = JSON.parse(receipts.text);
    receiptsOk = Array.isArray(rj.gates) && rj.gates.length >= 4;
  } catch {
    receiptsOk = false;
  }
  record("api/receipts gates", receipts.res.ok && receiptsOk);

  const release = await get("/api/release.json");
  let releaseOk = false;
  try {
    const rj = JSON.parse(release.text);
    releaseOk = rj.version === "0.2.8";
  } catch {
    releaseOk = false;
  }
  record("api/release.json", release.res.ok && releaseOk);
  record("release version 0.2.8", releaseOk);

  if (process.env.ALEFBA_ADMIN_TOKEN) {
    const exportJson = await get("/api/interest/export.json");
    let exportErr = "";
    try {
      exportErr = JSON.parse(exportJson.text).error || "";
    } catch {}
    record(
      "export.json 401 without token",
      exportJson.res.status === 401 && exportErr === "admin_required",
      String(exportJson.res.status)
    );
    const exportAuth = await fetch(`${BASE}/api/interest/export.json`, {
      headers: { "X-Alefba-Admin-Token": process.env.ALEFBA_ADMIN_TOKEN },
    });
    record("export.json 200 with admin token", exportAuth.status === 200, String(exportAuth.status));
    const exportCsv = await get("/api/interest/export.csv");
    record("export.csv 401 without token", exportCsv.res.status === 401, String(exportCsv.res.status));
  } else {
    record("export auth gate (set ALEFBA_ADMIN_TOKEN in CI)", true, "skipped locally");
  }

  const manifest = await get("/api/content-manifest");
  let manifestOk = false;
  try {
    const mj = JSON.parse(manifest.text);
    manifestOk = mj.epigraph?.en?.includes("Math guesses");
    record("manifest references SSOT", Array.isArray(mj.references) && mj.references.length >= 7);
  } catch {
    manifestOk = false;
    record("manifest references SSOT", false);
  }
  record("api/content-manifest SSOT", manifest.res.ok && manifestOk);

  const corpusInv = await get("/api/corpus-inventory");
  let corpusInvOk = false;
  try {
    const cj = JSON.parse(corpusInv.text);
    corpusInvOk =
      Array.isArray(cj.shards) &&
      cj.shards.length >= 8 &&
      Array.isArray(cj.licenseMap) &&
      cj.licenseMap.length >= 4 &&
      cj.plrBoundary?.includes("PLR");
  } catch {
    corpusInvOk = false;
  }
  record("api/corpus-inventory P1", corpusInv.res.ok && corpusInvOk);

  const corpusPipe = await get("/api/corpus-pipeline-report");
  let corpusPipeOk = false;
  try {
    const pj = JSON.parse(corpusPipe.text);
    corpusPipeOk = pj.pass === true && pj.totals?.indexedTrainShards >= 4;
  } catch {
    corpusPipeOk = false;
  }
  record("api/corpus-pipeline pass", corpusPipe.res.ok && corpusPipeOk);

  const tokSpec = await get("/api/tokenizer-v1-spec");
  let tokOk = false;
  try {
    const tj = JSON.parse(tokSpec.text);
    tokOk = tj.gate === "G1" && Array.isArray(tj.alphabet?.letters) && tj.alphabet.letters.length >= 32;
  } catch {
    tokOk = false;
  }
  record("api/tokenizer-v1-spec G1", tokSpec.res.ok && tokOk);

  const evalBase = await get("/api/eval-baselines");
  let evalBaseOk = false;
  try {
    const ej = JSON.parse(evalBase.text);
    evalBaseOk = Array.isArray(ej.baselines) && ej.baselines.length >= 5;
  } catch {
    evalBaseOk = false;
  }
  record("api/eval-baselines list", evalBase.res.ok && evalBaseOk);

  const evalHar = await get("/api/eval-harness");
  let evalHarOk = false;
  try {
    const hj = JSON.parse(evalHar.text);
    evalHarOk = Array.isArray(hj.suites) && hj.suites.some((s) => s.id === "alphabet_coverage");
  } catch {
    evalHarOk = false;
  }
  record("api/eval-harness v1", evalHar.res.ok && evalHarOk);

  const v1Health = await get("/api/v1/health");
  let v1Ok = false;
  try {
    const vj = JSON.parse(v1Health.text);
    v1Ok = vj.instructMvp === "not_live" && vj.service === "alefba-api";
  } catch {
    v1Ok = false;
  }
  record("api/v1 health instruct not_live", v1Health.res.ok && v1Ok);

  const fert = await get("/api/g1-tokenizer-receipt");
  let fertOk = false;
  try {
    const fj = JSON.parse(fert.text);
    fertOk = fj.pass === true && Number(fj.alefba?.charsPerToken) >= 2;
  } catch {
    fertOk = false;
  }
  record("g1 tokenizer fertility receipt", fert.res.ok && fertOk);

  const receiptsApi = await get("/api/receipts");
  let g1Honest = false;
  try {
    const rj = JSON.parse(receiptsApi.text);
    const g1 = rj.gates?.find((g) => g.id === "G1");
    g1Honest = g1?.status === "pass" && g1?.hfBaselineReport && (rj.scoreCards?.length || 0) >= 1;
  } catch {
    g1Honest = false;
  }
  record("G1 pass + HF score card", receiptsApi.res.ok && g1Honest);

  const recPage = await get("/receipts.html");

  const g2Card = await get("/api/g2-score-card");
  let g2Ok = false;
  try {
    const g2j = JSON.parse(g2Card.text);
    g2Ok = g2j.published === true && g2j.pass === true && g2j.gate === "G2";
  } catch {
    g2Ok = false;
  }
  record("G2 score card published", g2Card.res.ok && g2Ok);

  let g2GateOk = false;
  try {
    const rj = JSON.parse(receiptsApi.text);
    const g2 = rj.gates?.find((g) => g.id === "G2");
    const g2CardEntry = (rj.scoreCards || []).find((c) => c.gate === "G2");
    g2GateOk =
      g2?.status === "in_progress" &&
      g2?.scoreCard === "data/g2-score-card.json" &&
      Boolean(g2CardEntry);
  } catch {
    g2GateOk = false;
  }
  record("G2 gate in_progress + score card", receiptsApi.res.ok && g2GateOk);

  record("receipts G2 section", recPage.text.includes("g2-root") && recPage.text.includes("g2-science"));
  record("receipts page root", recPage.text.includes("receipts-root") && recPage.text.includes("pages.js"));
  record("receipts G1 section", recPage.text.includes("g1-root") && recPage.text.includes("g1-science"));

  const corpusPage = await get("/corpus.html");
  record("corpus ladder", corpusPage.text.includes("ladder-step") && corpusPage.text.includes("bookshelf-grid"));
  record("corpus FA i18n wired", corpusPage.text.includes('data-i18n="corpus.title"'));
  record("corpus provenance schema", corpusPage.text.includes("corpus.provTitle") && corpusPage.text.includes("corpus-prov-list"));
  record("corpus inventory root", corpusPage.text.includes("inventory-root"));

  const pressPage = await get("/press.html");
  record("press kit assets", pressPage.text.includes("og-society.svg") && pressPage.text.includes("copy-boilerplate"));
  record("press FA i18n wired", pressPage.text.includes('data-i18n="press.boiler"'));

  const dataRoom = await get("/data-room.html");
  record("data room index", dataRoom.text.includes("content-manifest") && dataRoom.text.includes('data-i18n="data.title"'));
  record("data room corpus inventory", dataRoom.text.includes("/api/corpus-inventory"));

  const pagesJs = await get("/pages.js");
  record("pages FA corpus title", pagesJs.text.includes("پیکره و برنامهٔ درسی"));
  record("pages FA receipts", pagesJs.text.includes("رسیدهای علمی"));
  record("no FA skin-in-game calque", !appJs.text.includes("پوست من در بازی"));
  record("no FA virality calque", !appJs.text.includes('"share.kicker": "ویروسی"'));
  record("FA institutional pitch", appJs.text.includes("خلاصهٔ ارائه"));
  record("content drift epigraph", appJs.text.includes("Math guesses; books teach; time makes it smarter") && manifestOk);
  record("WP FA charter not whitepaper loan", wpJs.text.includes('skip: "پرش به سند"') && !wpJs.text.includes("پرش به وایت‌پیپر"));
  record("no FA competitive pitch calque", !appJs.text.includes("مزیت:") && !appJs.text.includes("مسئله:"));

  // Browser smoke when Playwright is available
  try {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.setItem("alefba-lang", "fa"));
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("#menu-btn");
    await page.waitForTimeout(80);
    record("browser no pageerror on home", errors.length === 0, errors[0] || "");

    await page.locator("#menu-btn").click();
    await page.waitForTimeout(80);
    const menuOpen = await page.evaluate(
      () => document.body.classList.contains("nav-open") && !document.getElementById("nav-panel").hidden
    );
    record("browser menu opens", menuOpen);
    await page.locator("#nav-panel a").first().click({ force: true });
    await page.waitForTimeout(80);
    record("browser menu closes", await page.evaluate(() => !document.body.classList.contains("nav-open")));

    const fa = await page.evaluate(() => {
      const o = document.getElementById("sample-out");
      return { lang: o?.lang, dir: o?.dir };
    });
    record("browser sample FA rtl", fa.lang === "fa" && fa.dir === "rtl", `${fa.lang}/${fa.dir}`);
    await page.locator("#lang-btn").click();
    await page.waitForTimeout(80);
    const en = await page.evaluate(() => {
      const o = document.getElementById("sample-out");
      return { lang: o?.lang, dir: o?.dir };
    });
    // After toggle from FA → EN
    record("browser sample EN ltr", en.lang === "en" && en.dir === "ltr", `${en.lang}/${en.dir}`);

    await page.goto(`${BASE}/white-paper.html#pattern`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".wp-table-bilingual");
    const bi = await page.locator(".wp-table-bilingual .pat-en-line").count();
    record("browser pattern EN lines", bi >= 18, String(bi));
    const dir = await page.locator(".wp-table-bilingual .pat-en-line").first().evaluate((el) => getComputedStyle(el).direction);
    record("browser EN line CSS ltr", dir === "ltr", dir);

    await page.locator("#menu-btn").click();
    record("browser wp menu opens", await page.evaluate(() => document.body.classList.contains("nav-open")));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(60);
    record("browser wp menu escape", await page.evaluate(() => !document.body.classList.contains("nav-open")));

    await page.goto(`${BASE}/corpus.html`, { waitUntil: "domcontentloaded" });
    const corpusTitle = await page.locator("h1").first().textContent();
    record("browser corpus FA title", corpusTitle?.includes("پیکره") || corpusTitle?.includes("Corpus"), corpusTitle || "");
    const provRows = await page.locator(".corpus-prov-list li").count();
    record("browser corpus provenance rows", provRows >= 6, String(provRows));
    await page.waitForSelector("#inventory-root table", { timeout: 5000 });
    const invTables = await page.locator("#inventory-root table").count();
    record("browser corpus inventory tables", invTables >= 3, String(invTables));

    await page.goto(`${BASE}/#literature`, { waitUntil: "domcontentloaded" });
    const litVisible = await page.locator("#literature").isVisible();
    record("browser literature section", litVisible);
    const refCount = await page.locator("#literature .refs-list li").count();
    record("browser literature refs", refCount >= 7, String(refCount));

    await page.goto(`${BASE}/receipts.html`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#receipts-root table", { timeout: 5000 });
    const gateRows = await page.locator("#receipts-root table tbody tr").count();
    record("browser receipts gates", gateRows >= 4, String(gateRows));
    const g1Visible = await page.locator("#g1-root").isVisible();
    record("browser receipts G1 block", g1Visible);

    await browser.close();
  } catch (err) {
    const msg = String(err.message || err);
    if (msg.includes("Cannot find package") || msg.includes("playwright")) {
      record("browser smoke skipped (no playwright)", true, "install: npm run e2e:install");
    } else if (msg.includes("Executable doesn't exist") || msg.includes("browserType.launch")) {
      record("browser smoke skipped (no chromium)", true, "run: npm run e2e:install");
    } else {
      record("browser smoke", false, msg);
    }
  }

  const failed = checks.filter((c) => !c.ok);
  const verdict = failed.length === 0 ? "GREEN" : "RED";
  console.log(`\n${verdict}  ${checks.length - failed.length}/${checks.length} pass`);
  if (failed.length) {
    for (const f of failed) console.log(`  · ${f.name}${f.detail ? ` (${f.detail})` : ""}`);
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error("RED  E2E crash:", err.message || err);
  process.exit(1);
});
