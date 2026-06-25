function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function obtenerOrigenEnvio() {
  return {
    nombre: process.env.ECONNET_ORIGEN_NOMBRE || "Econnet",
    direccion:
      process.env.ECONNET_ORIGEN_DIRECCION ||
      "Dirección de origen pendiente",
    comuna: process.env.ECONNET_ORIGEN_COMUNA || "Santiago",
    region: process.env.ECONNET_ORIGEN_REGION || "Región Metropolitana",
  };
}

function construirPayloadBlueExpress(pedido, paquete) {
  const origen = obtenerOrigenEnvio();

  return {
    numeroPedido: pedido.numero,
    origen,
    destino: {
      nombre: pedido.nombreCliente,
      email: pedido.emailCliente,
      telefono: pedido.telefonoCliente || "",
      direccion: pedido.direccionTexto || pedido.direccion?.direccion || "",
      comuna: pedido.comuna || pedido.direccion?.comuna || "",
      region: pedido.region || pedido.direccion?.region || "",
    },
    paquete: {
      pesoGramos: paquete.pesoGramos,
      altoCm: paquete.altoCm,
      anchoCm: paquete.anchoCm,
      largoCm: paquete.largoCm,
    },
    items: (pedido.items || []).map((item) => ({
      nombre: item.nombreProducto,
      cantidad: item.cantidad,
      sku: item.producto?.sku || null,
    })),
  };
}

function crearRespuestaMockBlueExpress(pedido) {
  const timestamp = Date.now();

  return {
    modo: "mock",
    estado: "generado",
    servicio: "Blue Express Ecommerce",
    ordenServicio: `BX-OS-${pedido.id}-${String(timestamp).slice(-6)}`,
    numeroSeguimiento: `BX-${pedido.id}-${String(timestamp).slice(-8)}`,
    urlSeguimiento: `https://www.blue.cl/seguimiento?codigo=BX-${pedido.id}-${String(
      timestamp,
    ).slice(-8)}`,
    etiquetaUrl: null,
    costo: pedido.despacho || 0,
    respuestaOriginal: {
      mensaje:
        "Envío generado en modo prueba. No corresponde a una orden real de Blue Express.",
    },
  };
}

function normalizarRespuestaBlueExpress(data, pedido) {
  return {
    estado: "generado",
    servicio:
      data.servicio ||
      data.service ||
      data.nombreServicio ||
      "Blue Express",
    ordenServicio:
      data.ordenServicio ||
      data.os ||
      data.orderId ||
      data.id ||
      null,
    numeroSeguimiento:
      data.numeroSeguimiento ||
      data.tracking ||
      data.trackingNumber ||
      data.codigoSeguimiento ||
      null,
    urlSeguimiento:
      data.urlSeguimiento ||
      data.trackingUrl ||
      data.url_tracking ||
      null,
    etiquetaUrl:
      data.etiquetaUrl ||
      data.labelUrl ||
      data.urlEtiqueta ||
      null,
    costo: Number(data.costo || data.price || pedido.despacho || 0),
    respuestaOriginal: data,
  };
}

export async function crearEnvioBlueExpress(pedido, paquete) {
  const modo = process.env.BLUE_EXPRESS_MODO || "mock";

  if (modo === "mock") {
    return crearRespuestaMockBlueExpress(pedido);
  }

  const apiUrl = limpiarTexto(process.env.BLUE_EXPRESS_API_URL);
  const apiKey = limpiarTexto(process.env.BLUE_EXPRESS_API_KEY);
  const crearEnvioPath = limpiarTexto(
    process.env.BLUE_EXPRESS_CREAR_ENVIO_PATH,
  );

  if (!apiUrl || !apiKey || !crearEnvioPath) {
    throw new Error(
      "Blue Express no está configurado. Faltan BLUE_EXPRESS_API_URL, BLUE_EXPRESS_API_KEY o BLUE_EXPRESS_CREAR_ENVIO_PATH",
    );
  }

  const payload = construirPayloadBlueExpress(pedido, paquete);

  const respuesta = await fetch(`${apiUrl}${crearEnvioPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.mensaje ||
        data.message ||
        "No se pudo crear el envío en Blue Express",
    );
  }

  return normalizarRespuestaBlueExpress(data, pedido);
}