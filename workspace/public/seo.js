/** Alefbâ public SEO helpers — canonical origin + bilingual meta sync */
(function () {
  const SITE_ORIGIN = "https://alefba-production.up.railway.app";

  function abs(path) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${SITE_ORIGIN}${p}`;
  }

  function setMeta(attr, key, value) {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute("content", value);
  }

  function applySeo({ path, titles, descriptions, ogImage }) {
    const lang = document.documentElement.lang === "fa" ? "fa" : "en";
    const title = lang === "fa" ? titles.fa : titles.en;
    const desc = lang === "fa" ? descriptions.fa : descriptions.en;
    const url = abs(path);
    document.title = title;
    setMeta("name", "description", desc);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);
    if (ogImage) {
      const img = ogImage.startsWith("http") ? ogImage : abs(ogImage);
      setMeta("property", "og:image", img);
      setMeta("name", "twitter:image", img);
    }
  }

  window.AlefbaSeo = { SITE_ORIGIN, abs, applySeo };
})();
