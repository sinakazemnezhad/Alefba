/** dis-brand-agent repo=PLUS ONE product=DIS BRAND tag=DIS-PLUSONE-ALEFBA-WORKSPACE-PUBLIC-PAGES-JS name="DIS BRAND Governed Agent" action=edit at=2026-08-09T20:41:58.474Z */
(function () {
  const I18N = {
    en: {
      brand: "Alefbâ",
      brandSub: "Founding scientific charter",
      "nav.home": "Home",
      "nav.receipts": "Receipts",
      "nav.corpus": "Corpus",
      "nav.press": "Press",
      "nav.data": "Data room",
      "nav.pattern": "Pattern",
      "nav.join": "Join",
      "nav.commit": "Commit",
      "nav.pitch": "Pitch",
      langBtn: "فا",
      "receipts.eyebrow": "v0.2.8 · Receipt before claim",
      "receipts.title": "Scientific receipts",
      "receipts.lede": "Gates G1–G4 and dated score cards. No capability claim without a receipt on disk.",
      "receipts.colophon": "Capital spends only after gates pass. Marketing cannot open a gate.",
      "receipts.g1Title": "G1 · Tokenizer & eval harness",
      "receipts.g1Lede": "Spec on disk · probe coverage · baseline list — gate pending until fertility receipt vs named checkpoint.",
      "receipts.g1Spec": "Tokenizer v1 spec",
      "receipts.g1Probes": "Alphabet probes",
      "receipts.g1Baselines": "Baseline checkpoints",
      "receipts.g1Harness": "Eval harness v1",
      "receipts.g1Run": "Last G1 probe run",
      "receipts.g2Title": "G2 · Persian score card",
      "receipts.g2Lede": "Orthography · morphology · reading proxy vs BLOOM-560m on held probes.",
      "receipts.g2Card": "G2 score card",
      "receipts.g2Report": "G2 orthography report",
      "corpus.kicker": "Training rain · licensed bookshelf",
      "corpus.title": "Corpus & curriculum",
      "corpus.lede": "Persian-first stages from alphabet primers through books. Every shard needs provenance, license class, and quality grade.",
      "corpus.ladderTitle": "Curriculum ladder",
      "corpus.a0t": "Alphabet",
      "corpus.a0d": "Letters, joining forms, digits — character-level competence",
      "corpus.l0t": "Lexicon",
      "corpus.l0d": "Dictionaries, lemmas, collocations, named entities",
      "corpus.n0t": "Narrative",
      "corpus.n0d": "Stories, folk tales, short fiction — plot and causality",
      "corpus.b0t": "Books",
      "corpus.b0d": "Classical and contemporary long works — knowledge and register",
      "corpus.p0t": "Poetry",
      "corpus.p0d": "Controlled weight — prosody without rhyme lock",
      "corpus.i0t": "Instruct",
      "corpus.i0d": "Human-written Persian instruction pairs",
      "corpus.r0t": "Align",
      "corpus.r0d": "Preference data with native raters",
      "corpus.gateTitle": "Gate 1 — Tokenizer (the door)",
      "corpus.gateLede": "Rich vocab for الفبا + Persian orthography. Measure alphabet coverage and fertility vs multilingual baseline before base training.",
      "corpus.gateCta1": "View gate status",
      "corpus.gateCta2": "Publisher / corpus lane",
      "corpus.provTitle": "Per-shard provenance schema",
      "corpus.provLede": "Every text shard carries these fields before training — the contract publishers and capital expect to audit.",
      "corpus.prov1": "shard_id",
      "corpus.prov1d": "Unique identifier",
      "corpus.prov2": "license_class",
      "corpus.prov2d": "Licensed · public-domain · partner",
      "corpus.prov3": "source_class",
      "corpus.prov3d": "Publisher · lexicon · narrative · book",
      "corpus.prov4": "volume_band",
      "corpus.prov4d": "Volume band — never “all books”",
      "corpus.prov5": "quality_grade",
      "corpus.prov5d": "Quality grade + PII / noise filters",
      "corpus.prov6": "split",
      "corpus.prov6d": "train / val / public-eval — hard separation",
      "corpus.shelfTitle": "Bookshelf (indexed shards)",
      "corpus.s1t": "Primers & alphabet",
      "corpus.s1m": "Not yet indexed — provenance pending",
      "corpus.s2t": "Lexicon & dictionaries",
      "corpus.s2m": "Not yet indexed",
      "corpus.s3t": "Stories & narrative",
      "corpus.s3m": "Not yet indexed",
      "corpus.s4t": "Licensed books",
      "corpus.s4m": "Publisher conversations open",
      "corpus.inventoryTitle": "Corpus inventory v1 (disk)",
      "corpus.inventoryLede": "Volume bands, license map, and shard rows — honest nulls until indexed.",
      "corpus.inventoryLaw": "Alefbâ train curriculum only — field atlas lives in PLR.",
      "corpus.invBands": "Volume bands",
      "corpus.invLicense": "License map",
      "corpus.invShards": "Shard rows",
      "corpus.invEval": "Eval-only sources",
      "press.kicker": "Press & ambassadors",
      "press.title": "Press kit",
      "press.lede": "Boilerplate, assets, and share copy for scientific society outreach.",
      "press.boilerTitle": "Boilerplate",
      "press.boiler":
        "Alefbâ (الفبا) builds Persian foundation intelligence — a causal LM whose pretrain curriculum runs A0 alphabet through licensed books, with gates G1–G4 and dated score cards before scale. Founding scientific charter · receipt before claim · invest · join · donate.",
      "press.copyBoiler": "Copy boilerplate",
      "press.founderTitle": "Founder",
      "press.founder":
        "Sina Kazemnezhad — building Alefbâ to research Persian foundation intelligence rooted in our literature, with an open builder community.",
      "press.assetsTitle": "Assets",
      "press.asset1": "Logo mark (SVG)",
      "press.asset2": "OG image — charter",
      "press.asset3": "OG image — society",
      "press.asset4": "OG image — pattern",
      "press.citeTitle": "Citation",
      "press.cite": "Alefbâ / الفبا Founding Charter v0.2.8 (2026-08-09). Persian Foundation Intelligence.",
      "press.copyCite": "Copy citation",
      "press.shareTitle": "Share",
      "press.sharePitch":
        "Alefbâ · الفبا — Persian foundation intelligence. Founding scientific charter. Receipt before claim.",
      "data.kicker": "Investor data room",
      "data.title": "Founding documents",
      "data.lede": "Same story on disk and in browser. SSOT governance + live receipts + named research citations.",
      "data.d1": "Founding charter v0.2.8",
      "data.d1s": "Scientific plan",
      "data.d2": "Scientific receipts",
      "data.d2s": "Gates · score cards",
      "data.d3": "Corpus & curriculum",
      "data.d3s": "Gate 1 · bookshelf",
      "data.d4": "One-card pitch",
      "data.d4s": "Forwardable",
      "data.d5": "Press kit",
      "data.d5s": "Ambassadors",
      "data.d6": "Content manifest (JSON)",
      "data.d6s": "SSOT sync",
      "data.d8": "Corpus inventory (JSON)",
      "data.d8s": "P1 · G1 prep",
      "data.d9": "Tokenizer v1 spec (JSON)",
      "data.d9s": "G1 gate",
      "data.d10": "Eval baselines (JSON)",
      "data.d10s": "Named checkpoints",
      "data.d11": "Eval harness v1 (JSON)",
      "data.d11s": "Suite index",
      "data.d7": "Release manifest",
      "data.d7s": "Version · SHA",
      "data.colophon": "Disk SSOT: ALEFBA/governance/WHITE_PAPER.md · COMMERCIAL_SCIENTIFIC_PLAN.md · CONCEPT_BRIEF.md",
      "data.print": "Print / PDF one-pager",
    },
    fa: {
      brand: "الفبا",
      brandSub: "طرح بنیادین علمی",
      "nav.home": "خانه",
      "nav.receipts": "رسیدها",
      "nav.corpus": "پیکره",
      "nav.press": "رسانه",
      "nav.data": "اتاق داده",
      "nav.pattern": "الگو",
      "nav.join": "بپیوندید",
      "nav.commit": "ثبت‌نام",
      "nav.pitch": "ارائه",
      langBtn: "EN",
      "receipts.eyebrow": "نسخه ۰٫۲٫۱ · رسید قبل از ادعا",
      "receipts.title": "رسیدهای علمی",
      "receipts.lede": "دروازه‌های G1 تا G4 و کارت‌های نمرهٔ تاریخ‌دار. هیچ ادعای توانمندی بدون رسید روی دیسک نیست.",
      "receipts.colophon": "سرمایه پس از عبور دروازه خرج می‌شود. بازاریابی دروازه‌ای را نمی‌گشاید.",
      "receipts.g1Title": "G1 · توکنایزر و هارنس ارزیابی",
      "receipts.g1Lede": "سند روی دیسک · پوشش آزمون · فهرست خط مبنا — دروازه تا رسید باروری باز است.",
      "receipts.g1Spec": "مشخصات توکنایزر نسخه ۱",
      "receipts.g1Probes": "آزمون‌های الفبا",
      "receipts.g1Baselines": "چک‌پوینت‌های خط مبنا",
      "receipts.g1Harness": "هارنس ارزیابی v1",
      "receipts.g1Run": "آخرین اجرای G1",
      "receipts.g2Title": "G2 · کارت نمرهٔ فارسی",
      "receipts.g2Lede": "املاء · صرف · درک مطلب (پروکسی) در برابر BLOOM-560m روی آزمون‌های نگه‌داشته.",
      "receipts.g2Card": "کارت نمره G2",
      "receipts.g2Report": "گزارش املا G2",
      "corpus.kicker": "باران آموزش · قفسهٔ مجوزدار",
      "corpus.title": "پیکره و برنامهٔ درسی",
      "corpus.lede":
        "پله‌های فارسی‌محور از کتاب اولیهٔ الفبا تا ادبیات بلند. هر بخش منبع، نوع مجوز و درجهٔ کیفیت مشخص دارد.",
      "corpus.ladderTitle": "نردبان برنامهٔ درسی",
      "corpus.a0t": "الفبا",
      "corpus.a0d": "حروف، اشکال آمیخته، ارقام — شایستگی در سطح نشانه",
      "corpus.l0t": "واژگان",
      "corpus.l0d": "فرهنگ‌ها، ریشه‌ها، هم‌ایستایی، موجودیت‌های نام‌دار",
      "corpus.n0t": "روایت",
      "corpus.n0d": "داستان، قصهٔ عامیانه، داستان کوتاه — علت، انگیزه، پیامد",
      "corpus.b0t": "کتاب",
      "corpus.b0d": "آثار کلاسیک و معاصر بلند — دانش و گونهٔ زبانی",
      "corpus.p0t": "شعر",
      "corpus.p0d": "وزن کنترل‌شده — عروض بدون قفل قافیه",
      "corpus.i0t": "دستورپذیری",
      "corpus.i0d": "جفت‌های دستوری نوشته‌شده به فارسی انسانی",
      "corpus.r0t": "هم‌ترازی",
      "corpus.r0d": "دادهٔ ترجیح با داوران بومی",
      "corpus.gateTitle": "دروازهٔ ۱ — توکنایزر (درِ ورود)",
      "corpus.gateLede":
        "واژگان غنی برای الفبا و املای فارسی. پیش از آموزش پایه، پوشش الفبا و باروری را در برابر خط مبنا بسنجید.",
      "corpus.gateCta1": "وضعیت دروازه",
      "corpus.gateCta2": "مسیر ناشر / پیکره",
      "corpus.provTitle": "فهرست منبع هر بخش",
      "corpus.provLede": "هر بخش متن قبل از آموزش این فیلدها را دارد — همان قراردادی که ناشران و سرمایه می‌خواهند ببینند.",
      "corpus.prov1": "shard_id",
      "corpus.prov1d": "شناسهٔ یکتا",
      "corpus.prov2": "license_class",
      "corpus.prov2d": "مجوز · دامنهٔ عمومی · شریک",
      "corpus.prov3": "source_class",
      "corpus.prov3d": "ناشر · فرهنگ · روایت · کتاب",
      "corpus.prov4": "volume_band",
      "corpus.prov4d": "باند حجم — نه «همهٔ کتاب‌ها»",
      "corpus.prov5": "quality_grade",
      "corpus.prov5d": "درجهٔ کیفیت و فیلتر نویز",
      "corpus.prov6": "split",
      "corpus.prov6d": "train / val / public-eval — جداسازی سخت",
      "corpus.shelfTitle": "قفسه (بخش‌های فهرست‌شده)",
      "corpus.s1t": "کتاب‌های اولیه و الفبا",
      "corpus.s1m": "هنوز فهرست نشده — منبع در انتظار",
      "corpus.s2t": "واژه‌نامه و فرهنگ",
      "corpus.s2m": "هنوز فهرست نشده",
      "corpus.s3t": "داستان و روایت",
      "corpus.s3m": "هنوز فهرست نشده",
      "corpus.s4t": "کتاب‌های مجوزدار",
      "corpus.s4m": "گفتگو با ناشران آغاز شده",
      "corpus.inventoryTitle": "فهرست پیکره نسخه ۱ (روی دیسک)",
      "corpus.inventoryLede": "باند حجم، نقشهٔ مجوز، و ردیف بخش — null صادق تا فهرست شود.",
      "corpus.inventoryLaw": "فقط مسیر آموزش الفبا — اطلس میدان در PLR است.",
      "corpus.invBands": "باند حجم",
      "corpus.invLicense": "نقشهٔ مجوز",
      "corpus.invShards": "ردیف بخش",
      "corpus.invEval": "منابع فقط ارزیابی",
      "press.kicker": "رسانه و معرفان",
      "press.title": "کیت مطبوعاتی",
      "press.lede": "متن پایه، اقلام بصری و نسخهٔ اشتراک برای گسترش جامعه.",
      "press.boilerTitle": "متن پایه",
      "press.boiler":
        "الفبا مدل زبانی فارسی می‌سازد — از الفبا تا کتاب مجوزدار، با مراحل سنجش شفاف (G1–G4) قبل از مقیاس. طرح بنیادین · اول نتیجه، بعد ادعا · سرمایه · همراهی · حمایت مالی.",
      "press.copyBoiler": "رونوشت متن پایه",
      "press.founderTitle": "بنیان‌گذار",
      "press.founder":
        "سینا کاظم‌نژاد — الفبا را برای پژوهش هوش بنیادین فارسی، ریشه در ادبیات خودمان و با جامعهٔ باز توسعه‌دهندگان می‌سازد.",
      "press.assetsTitle": "اقلام بصری",
      "press.asset1": "نشان (SVG)",
      "press.asset2": "تصویر اشتراک — طرح",
      "press.asset3": "تصویر اشتراک — جامعه",
      "press.asset4": "تصویر اشتراک — الگو",
      "press.citeTitle": "استناد",
      "press.cite": "الفبا — سند بنیادگذاری نسخه ۰٫۲٫۱ (۲۰۲۶-۰۸-۰۹). مدل زبانی فارسی.",
      "press.copyCite": "رونوشت استناد",
      "press.shareTitle": "اشتراک",
      "press.sharePitch":
        "الفبا · مدل زبانی فارسی. طرح بنیادین. اول نتیجه، بعد ادعا.",
      "data.kicker": "اتاق دادهٔ سرمایه‌گذار",
      "data.title": "اسناد بنیادگذار",
      "data.lede": "یک روایت روی دیسک و در مرورگر — سند، رسیدها، پیکره و استنادهای پژوهشی نام‌دار.",
      "data.d1": "سند بنیادگذاری نسخه ۰٫۲٫۷",
      "data.d1s": "طرح علمی",
      "data.d2": "رسیدهای علمی",
      "data.d2s": "دروازه · کارت نمره",
      "data.d3": "پیکره و برنامهٔ درسی",
      "data.d3s": "دروازه ۱ · قفسه",
      "data.d4": "ارائهٔ یک‌صفحه‌ای",
      "data.d4s": "قابل ارسال",
      "data.d5": "کیت مطبوعاتی",
      "data.d5s": "معرفان",
      "data.d6": "نمایهٔ محتوا (JSON)",
      "data.d6s": "همگام‌سازی منبع واحد",
      "data.d8": "فهرست پیکره (JSON)",
      "data.d8s": "P1 · آمادهٔ G1",
      "data.d9": "مشخصات توکنایزر v1 (JSON)",
      "data.d9s": "دروازه G1",
      "data.d10": "خط مبنای ارزیابی (JSON)",
      "data.d10s": "چک‌پوینت نام‌دار",
      "data.d11": "هارنس ارزیابی v1 (JSON)",
      "data.d11s": "فهرست سوئیت",
      "data.d7": "نمایهٔ انتشار",
      "data.d7s": "نسخه · اثر انگشت",
      "data.colophon": "منبع واحد روی دیسک: ALEFBA/governance/WHITE_PAPER.md · COMMERCIAL_SCIENTIFIC_PLAN.md · CONCEPT_BRIEF.md",
      "data.print": "چاپ / PDF یک‌صفحه‌ای",
    },
  };

  function dictFor(lang) {
    return I18N[lang] || I18N.en;
  }

  function captureUtm() {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref") || params.get("utm_source");
    if (ref) {
      try {
        localStorage.setItem("alefba-ref", ref.slice(0, 64));
      } catch (_) {}
    }
  }

  function updatePressShare(lang) {
    const pitch = dictFor(lang)["press.sharePitch"];
    if (!pitch) return;
    const url = location.origin + "/";
    const tg = document.getElementById("share-tg-press");
    const wa = document.getElementById("share-wa-press");
    const x = document.getElementById("share-x-press");
    if (tg) tg.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(pitch)}`;
    if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(`${pitch} ${url}`)}`;
    if (x) x.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(pitch)}&url=${encodeURIComponent(url)}`;
  }

  function applyLang(lang) {
    const dict = dictFor(lang);
    document.documentElement.lang = lang === "fa" ? "fa" : "en";
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.documentElement.dataset.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (dict[k] != null) el.textContent = dict[k];
    });
    const btn = document.getElementById("lang-btn");
    if (btn) btn.textContent = dict.langBtn;
    localStorage.setItem("alefba-lang", lang);
    updatePressShare(lang);
    renderReceipts();
    renderInventory();
    renderG1();
  }

  function initMenu() {
    const btn = document.getElementById("menu-btn");
    const panel = document.getElementById("nav-panel");
    if (!btn || !panel) return;
    const close = () => {
      document.body.classList.remove("nav-open");
      panel.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    };
    const open = () => {
      document.body.classList.add("nav-open");
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    };
    btn.addEventListener("click", () => (panel.hidden ? open() : close()));
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  function statusLabel(status, lang) {
    const map = {
      pending: lang === "fa" ? "در انتظار" : "Pending",
      in_progress: lang === "fa" ? "در حال انجام" : "In progress",
      pass: lang === "fa" ? "تأیید" : "Pass",
      fail: lang === "fa" ? "رد" : "Fail",
    };
    return map[status] || map.pending;
  }

  async function renderReceipts() {
    const root = document.getElementById("receipts-root");
    if (!root) return;
    const lang = document.documentElement.dataset.lang || "fa";
    const thDate = lang === "fa" ? "تاریخ" : "Date";
    const thModel = lang === "fa" ? "مدل" : "Model";
    const thSplit = lang === "fa" ? "بخش‌بندی" : "Split";
    const thNotes = lang === "fa" ? "یادداشت" : "Notes";
    try {
      const data = await (await fetch("/api/receipts")).json();
      const gates = data.gates || [];
      const cards = data.scoreCards || [];
      let html = `<table class="receipt-table"><thead><tr><th>${lang === "fa" ? "دروازه" : "Gate"}</th><th>${lang === "fa" ? "وضعیت" : "Status"}</th><th>${lang === "fa" ? "معیار" : "Criteria"}</th></tr></thead><tbody>`;
      for (const g of gates) {
        html += `<tr><td><strong>${g.id}</strong> ${g.name}</td><td><span class="status-badge status-badge--${g.status || "pending"}">${statusLabel(g.status, lang)}</span></td><td>${g.criteria || ""}</td></tr>`;
      }
      html += "</tbody></table>";
      if (!cards.length) {
        html += `<p class="colophon">${lang === "fa" ? "هنوز کارت نمرهٔ منتشر نشده — رسید قبل از ادعا." : "No score cards published yet — receipt before claim."}</p>`;
      } else {
        html += `<h3>${lang === "fa" ? "کارت‌های نمره" : "Score cards"}</h3><table class="receipt-table"><thead><tr><th>${thDate}</th><th>${thModel}</th><th>${thSplit}</th><th>${thNotes}</th></tr></thead><tbody>`;
        for (const c of cards) {
          const metric = c.metric ? `${c.metric}: ${c.score ?? "—"}` : "";
          const baseline = c.baselineScore != null ? ` · ${c.baseline}: ${c.baselineScore}` : "";
          const lift = c.liftPct != null ? ` · lift ${c.liftPct}%` : "";
          const detail = [metric, baseline, lift, c.notes || ""].filter(Boolean).join(" ");
          html += `<tr><td>${c.date || "—"}</td><td>${c.gate || "—"} · ${c.modelHash || "—"}</td><td>${c.split || "—"}</td><td>${detail}</td></tr>`;
        }
        html += "</tbody></table>";
      }
      root.innerHTML = html;
    } catch {
      root.innerHTML = `<p class="colophon">${lang === "fa" ? "رسیدها در دسترس نیست." : "Receipts unavailable."}</p>`;
    }
  }

  function renderBookshelf(data) {
    const grid = document.querySelector(".bookshelf-grid");
    if (!grid || !data?.shards) return;
    const lang = document.documentElement.dataset.lang || "fa";
    const indexed = data.shards.filter((s) => s.status === "indexed");
    const slots = [
      { key: "A0", title: lang === "fa" ? "الفبا و آزمون" : "Alphabet & probes" },
      { key: "L0", title: lang === "fa" ? "واژگان" : "Lexicon" },
      { key: "N0", title: lang === "fa" ? "روایت" : "Narrative" },
      { key: "B0", title: lang === "fa" ? "کتاب" : "Books" },
    ];
    grid.innerHTML = slots
      .map(({ key, title }) => {
        const hits = indexed.filter((s) => s.curriculum === key);
        const meta = hits.length
          ? hits.map((h) => h.shard_id).join(", ")
          : lang === "fa"
            ? "در انتظار فهرست"
            : "Awaiting index";
        return `<div class="shelf-slot"><strong>${title}</strong><p class="meta">${meta}</p></div>`;
      })
      .join("");
  }

  async function renderInventory() {
    const root = document.getElementById("inventory-root");
    if (!root) return;
    const lang = document.documentElement.dataset.lang || "fa";
    const dict = dictFor(lang);
    const statusLabel = (s) => {
      const map = {
        pending: lang === "fa" ? "در انتظار" : "Pending",
        conversation_open: lang === "fa" ? "گفتگو باز" : "Conversation open",
        inventory_pending: lang === "fa" ? "فهرست در انتظار" : "Inventory pending",
        sample_indexed: lang === "fa" ? "نمونه فهرست شد" : "Sample indexed",
        pd_sample_indexed: lang === "fa" ? "نمونه دامنهٔ عمومی" : "PD sample indexed",
        indexed: lang === "fa" ? "فهرست شد" : "Indexed",
        indexed_external: lang === "fa" ? "خارجی · فقط ارزیابی" : "External · eval",
        not_indexed: lang === "fa" ? "فهرست نشده" : "Not indexed",
        harness_pending: lang === "fa" ? "هارنس در انتظار" : "Harness pending",
        guild_forming: lang === "fa" ? "صنف در شکل‌گیری" : "Guild forming",
      };
      return map[s] || s || "—";
    };
    try {
      const data = await (await fetch("/api/corpus-inventory")).json();
      const bands = data.volumeBands || {};
      const shards = data.shards || [];
      const license = data.licenseMap || [];
      const evals = data.evalSources || [];
      let html = `<h3>${dict["corpus.invBands"]}</h3><table class="receipt-table"><thead><tr><th>${lang === "fa" ? "کلاس" : "Class"}</th><th>${lang === "fa" ? "وضعیت" : "Status"}</th><th>${lang === "fa" ? "باند هدف" : "Target band"}</th></tr></thead><tbody>`;
      for (const [key, band] of Object.entries(bands)) {
        html += `<tr><td><code>${key}</code></td><td>${statusLabel(band.status)}</td><td>${band.targetBand || "—"}</td></tr>`;
      }
      html += "</tbody></table>";
      html += `<h3>${dict["corpus.invLicense"]}</h3><table class="receipt-table"><thead><tr><th>${lang === "fa" ? "شناسه" : "ID"}</th><th>${lang === "fa" ? "وضعیت" : "Status"}</th><th>${lang === "fa" ? "یادداشت" : "Note"}</th></tr></thead><tbody>`;
      for (const row of license) {
        html += `<tr><td><code>${row.id}</code></td><td>${statusLabel(row.status)}</td><td>${row.note || "—"}</td></tr>`;
      }
      html += "</tbody></table>";
      html += `<h3>${dict["corpus.invShards"]} (${shards.length})</h3><table class="receipt-table"><thead><tr><th>shard_id</th><th>${lang === "fa" ? "درس" : "Class"}</th><th>${lang === "fa" ? "مجوز" : "License"}</th><th>${lang === "fa" ? "وضعیت" : "Status"}</th><th>${lang === "fa" ? "دروازه" : "Gate"}</th></tr></thead><tbody>`;
      for (const s of shards) {
        html += `<tr><td><code>${s.shard_id}</code></td><td>${s.curriculum || "—"}</td><td>${s.license_class || "—"}</td><td>${statusLabel(s.status)}</td><td>${s.gate || "—"}</td></tr>`;
      }
      html += "</tbody></table>";
      if (evals.length) {
        html += `<h3>${dict["corpus.invEval"]}</h3><ul class="doc-list">`;
        for (const e of evals) {
          html += `<li><strong>${e.id}</strong><span>${statusLabel(e.status)} · ${e.note || ""}</span></li>`;
        }
        html += "</ul>";
      }
      root.innerHTML = html;
      renderBookshelf(data);
    } catch {
      root.innerHTML = `<p class="colophon">${lang === "fa" ? "فهرست پیکره در دسترس نیست." : "Corpus inventory unavailable."}</p>`;
    }
  }

  async function renderG1() {
    const root = document.getElementById("g1-root");
    if (!root) return;
    const lang = document.documentElement.dataset.lang || "fa";
    const dict = dictFor(lang);
    try {
      const [spec, baselines, harness, report, fertility] = await Promise.all([
        fetch("/api/tokenizer-v1-spec").then((r) => r.json()),
        fetch("/api/eval-baselines").then((r) => r.json()),
        fetch("/api/eval-harness").then((r) => r.json()),
        fetch("/api/g1-report").then((r) => r.json()),
        fetch("/api/g1-tokenizer-receipt").then((r) => r.json()),
      ]);
      const bl = baselines.baselines || [];
      const suites = harness.suites || [];
      let html = `<ul class="doc-list">`;
      html += `<li><a href="/api/tokenizer-v1-spec">${dict["receipts.g1Spec"]}</a><span>${spec.version || "—"} · ${spec.algorithm?.family || ""}</span></li>`;
      html += `<li><a href="/api/eval-baselines">${dict["receipts.g1Baselines"]}</a><span>${bl.length} ${lang === "fa" ? "چک‌پوینت" : "checkpoints"}</span></li>`;
      html += `<li><a href="/api/eval-harness">${dict["receipts.g1Harness"]}</a><span>${suites.length} ${lang === "fa" ? "سوئیت" : "suites"}</span></li>`;
      html += `</ul>`;
      html += `<h3>${dict["receipts.g1Probes"]}</h3><p class="colophon">${lang === "fa" ? "۱۵ خط آزمون الفبا · ۸ خط املا — data/eval-probes/" : "15 alphabet lines · 8 orthography lines — data/eval-probes/"}</p>`;
      if (fertility && fertility.alefba) {
        html += `<h3>${dict["receipts.g1Run"]} · fertility</h3><p><strong>${fertility.pass ? (lang === "fa" ? "رسید باروری pass" : "Fertility pass") : (lang === "fa" ? "در حال سنجش" : "pending")}</strong> · ${fertility.alefba.charsPerToken} ${lang === "fa" ? "حرف/توکن" : "chars/token"} · <a href="/api/g1-tokenizer-receipt">JSON</a></p>`;
      }
      if (report && report.pass != null) {
        html += `<h3>${dict["receipts.g1Run"]}</h3><p><strong>${report.pass ? (lang === "fa" ? "آزمون پیکره pass" : "Probe corpus pass") : (lang === "fa" ? "fail" : "fail")}</strong> · ${report.letterCoveragePct ?? "—"}% ${lang === "fa" ? "پوشش حرف" : "letter coverage"} · <a href="/api/g1-report">JSON</a></p>`;
        html += `<p class="colophon">${lang === "fa" ? "عبور دروازه G1 نیازمند رسید باروری در برابر خط مبنا است — نه تنها آزمون پیکره." : "G1 gate still requires fertility receipt vs named baseline — not probe pass alone."}</p>`;
      } else {
        html += `<p class="colophon">${lang === "fa" ? "اجرای محلی: npm run test:g1" : "Local run: npm run test:g1"}</p>`;
      }
      if (bl.length) {
        html += `<table class="receipt-table"><thead><tr><th>${lang === "fa" ? "شناسه" : "ID"}</th><th>HF</th><th>${lang === "fa" ? "وضعیت" : "Status"}</th></tr></thead><tbody>`;
        for (const b of bl.slice(0, 8)) {
          html += `<tr><td><code>${b.id}</code></td><td>${b.huggingfaceId || "—"}</td><td>${b.status}</td></tr>`;
        }
        html += "</tbody></table>";
      }
      root.innerHTML = html;
    } catch {
      root.innerHTML = `<p class="colophon">${lang === "fa" ? "G1 علمی در دسترس نیست." : "G1 science bundle unavailable."}</p>`;
    }
  }

  async function renderG2() {
    const root = document.getElementById("g2-root");
    if (!root) return;
    const lang = document.documentElement.dataset.lang || "fa";
    const dict = dictFor(lang);
    try {
      const card = await fetch("/api/g2-score-card").then((r) => r.json());
      if (!card.published) {
        root.innerHTML = `<p class="colophon">${lang === "fa" ? "کارت نمره G2 هنوز منتشر نشده." : "G2 score card not published yet."}</p>`;
        return;
      }
      let html = `<ul class="doc-list">`;
      html += `<li><a href="/api/g2-score-card">${dict["receipts.g2Card"]}</a><span>${card.score}% ${lang === "fa" ? "وفاداری" : "fidelity"} · ${card.baseline} ${card.baselineScore}%</span></li>`;
      html += `<li><a href="/api/g2-orthography-report">${dict["receipts.g2Report"]}</a><span>${card.class || "—"}</span></li>`;
      html += `</ul>`;
      if (card.suites) {
        html += `<table class="receipt-table"><thead><tr><th>${lang === "fa" ? "سوئیت" : "Suite"}</th><th>الفبا</th><th>BLOOM</th><th>${lang === "fa" ? "فاصله" : "Lift"}</th></tr></thead><tbody>`;
        for (const [name, row] of Object.entries(card.suites)) {
          html += `<tr><td><code>${name}</code></td><td>${row.alefbaPct}%</td><td>${row.bloom560mPct}%</td><td>${row.liftPct}%</td></tr>`;
        }
        html += "</tbody></table>";
      }
      html += `<p class="colophon">${card.note || ""}</p>`;
      root.innerHTML = html;
    } catch {
      root.innerHTML = `<p class="colophon">${lang === "fa" ? "G2 در دسترس نیست." : "G2 bundle unavailable."}</p>`;
    }
  }

  function initPressCopy() {
    document.getElementById("copy-boilerplate")?.addEventListener("click", () =>
      navigator.clipboard?.writeText(document.getElementById("press-boilerplate")?.textContent || "")
    );
    document.getElementById("copy-cite-press")?.addEventListener("click", () =>
      navigator.clipboard?.writeText(document.getElementById("press-cite")?.textContent || "")
    );
  }

  captureUtm();
  applyLang(localStorage.getItem("alefba-lang") || "fa");
  initMenu();
  initPressCopy();
  renderInventory();
  renderG1();
  renderG2();
  document.getElementById("lang-btn")?.addEventListener("click", () => {
    const cur = document.documentElement.dataset.lang || "fa";
    applyLang(cur === "en" ? "fa" : "en");
  });
})();
