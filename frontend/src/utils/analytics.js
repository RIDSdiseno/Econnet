// Helpers centralizados para GA4 (gtag) y Meta Pixel (fbq).
// Las IDs se inyectan desde index.html vía variables de entorno Vite.

function gaEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

function pixelEvent(name, params = {}) {
  if (typeof window.fbq === "function") {
    window.fbq("track", name, params);
  }
}

function toGA4Item(product, quantity = 1) {
  return {
    item_id: String(product.id),
    item_name: product.nombre,
    item_brand: product.marca?.nombre || product.marca || undefined,
    item_category: product.categoria?.nombre || product.categoria || undefined,
    price: Number(product.precio) || 0,
    quantity: Number(quantity) || 1,
  };
}

/** Llamar en cada cambio de ruta; excluye /admin automáticamente. */
export function trackPageView(pathname) {
  if (pathname.startsWith("/admin")) return;

  gaEvent("page_view", {
    page_path: pathname,
    page_location: window.location.origin + pathname,
  });

  if (typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

/** /productos — cuando se renderiza el listado de productos */
export function trackViewItemList(products, listName = "Catálogo") {
  if (!Array.isArray(products) || products.length === 0) return;

  gaEvent("view_item_list", {
    item_list_name: listName,
    items: products.map((p) => toGA4Item(p)),
  });
}

/** /producto/:id — al cargar el detalle del producto */
export function trackViewItem(product) {
  if (!product) return;

  gaEvent("view_item", {
    currency: "CLP",
    value: Number(product.precio) || 0,
    items: [toGA4Item(product)],
  });

  pixelEvent("ViewContent", {
    content_ids: [String(product.id)],
    content_name: product.nombre,
    content_type: "product",
    value: Number(product.precio) || 0,
    currency: "CLP",
  });
}

/** Al agregar al carrito (desde listado o desde detalle) */
export function trackAddToCart(product, quantity = 1) {
  if (!product) return;

  gaEvent("add_to_cart", {
    currency: "CLP",
    value: (Number(product.precio) || 0) * quantity,
    items: [toGA4Item(product, quantity)],
  });

  pixelEvent("AddToCart", {
    content_ids: [String(product.id)],
    content_name: product.nombre,
    content_type: "product",
    value: (Number(product.precio) || 0) * quantity,
    currency: "CLP",
  });
}

/** /checkout — al cargar el checkout con ítems */
export function trackBeginCheckout(items, value) {
  if (!Array.isArray(items) || items.length === 0) return;

  gaEvent("begin_checkout", {
    currency: "CLP",
    value: Number(value) || 0,
    items: items.map((p) => toGA4Item(p, p.cantidad || 1)),
  });

  pixelEvent("InitiateCheckout", {
    value: Number(value) || 0,
    currency: "CLP",
    num_items: items.reduce((sum, p) => sum + (p.cantidad || 1), 0),
  });
}

/** /checkout — al confirmar el método de pago antes de procesar */
export function trackAddPaymentInfo(items, value, paymentType) {
  if (!Array.isArray(items) || items.length === 0) return;

  gaEvent("add_payment_info", {
    currency: "CLP",
    value: Number(value) || 0,
    payment_type: paymentType || "unknown",
    items: items.map((p) => toGA4Item(p, p.cantidad || 1)),
  });
}

/** /compra-exitosa — cuando el pago es aprobado */
export function trackPurchase(order) {
  if (!order) return;

  const rawItems =
    order.items || order.detalles || order.productos || [];

  const items = rawItems.map((item) => {
    const producto = item.producto || item;
    return toGA4Item(
      { ...producto, precio: item.precio || producto.precio },
      item.cantidad || 1,
    );
  });

  const eventParams = {
    transaction_id: String(order.numero || order.id),
    value: Number(order.total) || 0,
    currency: "CLP",
    tax: Number(order.iva) || 0,
    shipping: Number(order.despacho) || 0,
  };

  if (items.length > 0) {
    eventParams.items = items;
  }

  gaEvent("purchase", eventParams);

  const pixelParams = {
    value: Number(order.total) || 0,
    currency: "CLP",
  };

  if (items.length > 0) {
    pixelParams.content_ids = items.map((i) => i.item_id);
    pixelParams.contents = items.map((i) => ({
      id: i.item_id,
      quantity: i.quantity,
    }));
    pixelParams.content_type = "product";
    pixelParams.num_items = items.reduce((sum, i) => sum + i.quantity, 0);
  }

  pixelEvent("Purchase", pixelParams);
}
