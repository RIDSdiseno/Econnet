import { useEffect } from "react";

const SITE_NAME = "Econnet";
const DEFAULT_DESC =
  "Compra online notebooks, monitores, almacenamiento y accesorios tecnológicos al mejor precio en Chile. Despacho a todo el país.";
const DEFAULT_IMAGE = "https://econnet.cl/img/og-default.png";

function setMeta(attr, name, content) {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function removeCanonical() {
  document.querySelector('link[rel="canonical"]')?.remove();
}

export function useMeta({ title, description, image, url, type = "website", canonical } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const desc = description || DEFAULT_DESC;
    const img = image || DEFAULT_IMAGE;
    const pageUrl = url || window.location.href;

    document.title = fullTitle;

    setMeta("name", "description", desc);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:image", img);
    setMeta("property", "og:url", pageUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "es_CL");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    if (canonical) {
      setCanonical(canonical);
    }

    return () => {
      document.title = SITE_NAME;
      if (canonical) removeCanonical();
    };
  }, [title, description, image, url, type, canonical]);
}
