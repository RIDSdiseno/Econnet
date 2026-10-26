import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "econnet_cookie_consent";
const CONSENT_VERSION = "v1.0-2026-10";

function cargarGA4() {
  const id = import.meta.env.VITE_GA4_ID;
  if (!id || window.__ga4Loaded) return;
  window.__ga4Loaded = true;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id, { send_page_view: false });
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
  document.head.appendChild(s);
}

function cargarMetaPixel() {
  const id = import.meta.env.VITE_META_PIXEL_ID;
  if (!id || window.__pixelLoaded) return;
  window.__pixelLoaded = true;
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
    t = b.createElement(e); t.async = true; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  window.fbq("init", id);
}

function cargarClarity() {
  const id = import.meta.env.VITE_CLARITY_ID;
  if (!id || window.__clarityLoaded) return;
  window.__clarityLoaded = true;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", id);
}

export function cargarAnalyticsSiConsentido() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return;
    const consent = JSON.parse(raw);
    if (consent.aceptado) {
      cargarGA4();
      cargarMetaPixel();
      cargarClarity();
    }
  } catch (_) {}
}

function guardarConsentimiento(aceptado) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      aceptado,
      fecha: new Date().toISOString(),
      version: CONSENT_VERSION,
    }));
  } catch (_) {}
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const consent = JSON.parse(raw);
        if (consent.aceptado) {
          cargarGA4();
          cargarMetaPixel();
          cargarClarity();
        }
        return;
      }
    } catch (_) {}
    // Sin consentimiento previo: mostrar banner tras 1 segundo
    const t = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const aceptar = () => {
    guardarConsentimiento(true);
    cargarGA4();
    cargarMetaPixel();
    cargarClarity();
    setVisible(false);
  };

  const rechazar = () => {
    guardarConsentimiento(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay oscuro detrás */}
      <div className="fixed inset-0 z-40 bg-black/40" />

      {/* Banner centrado */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-800 leading-relaxed mb-5">
            <span className="font-black text-gray-900 text-base">🍪 Usamos cookies</span>
            <br />
            Usamos cookies para medir el tráfico y mejorar tu experiencia de compra.
            Puedes aceptar todas o solo las estrictamente necesarias.{" "}
            <Link to="/politica-cookies" className="underline font-semibold text-gray-900 hover:text-gray-600">
              Política de cookies
            </Link>
          </p>
          <div className="flex gap-3">
            <button
              onClick={rechazar}
              className="flex-1 py-3 text-sm font-bold border-2 border-gray-900 rounded-xl text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Solo esenciales
            </button>
            <button
              onClick={aceptar}
              className="flex-1 py-3 text-sm font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
            >
              Aceptar todo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
