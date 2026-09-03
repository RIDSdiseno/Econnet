import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Input, Radio, Select, Divider, message } from "antd";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  CreditCardOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  obtenerCarrito,
  obtenerProductoPorId,
  obtenerDirecciones,
  crearPedido,
  calcularDespacho,
  crearPagoWebpay,
  crearPagoMercadoPago,
  obtenerMediosPago,
  crearPagoOneclick,
} from "../services/api";
import {
  obtenerCarritoInvitado,
  vaciarCarritoInvitado,
} from "../utils/carritoInvitado";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

const OPCIONES_REGIONES = [
  { value: "Arica y Parinacota", label: "Arica y Parinacota" },
  { value: "Tarapacá", label: "Tarapacá" },
  { value: "Antofagasta", label: "Antofagasta" },
  { value: "Atacama", label: "Atacama" },
  { value: "Coquimbo", label: "Coquimbo" },
  { value: "Valparaíso", label: "Valparaíso" },
  { value: "Región Metropolitana", label: "Región Metropolitana" },
  {
    value: "Libertador General Bernardo O'Higgins",
    label: "Libertador General Bernardo O'Higgins",
  },
  { value: "Maule", label: "Maule" },
  { value: "Ñuble", label: "Ñuble" },
  { value: "Biobío", label: "Biobío" },
  { value: "La Araucanía", label: "La Araucanía" },
  { value: "Los Ríos", label: "Los Ríos" },
  { value: "Los Lagos", label: "Los Lagos" },
  {
    value: "Aysén del General Carlos Ibáñez del Campo",
    label: "Aysén del General Carlos Ibáñez del Campo",
  },
  {
    value: "Magallanes y de la Antártica Chilena",
    label: "Magallanes y de la Antártica Chilena",
  },
];

function adaptarItemCheckout(item) {
  const producto = item.producto;

  const imagenPrincipal =
    producto.imagenes?.find((imagen) => imagen.esPrincipal)?.url ||
    producto.imagenes?.find((imagen) => imagen.tipo !== "oferta_wide")?.url ||
    producto.imagenes?.[0]?.url ||
    "/img/productos/producto.png";

  return {
    id: producto.id,
    nombre: producto.nombre,
    marca: producto.marca?.nombre || "Sin marca",
    imagen: imagenPrincipal,
    precio: producto.precio,
    precioNormal: producto.precioNormal || producto.precio,
    descuento: producto.enOferta ? producto.descuento || 0 : 0,
    cantidad: item.cantidad,
  };
}

function adaptarProductoInvitadoCheckout(producto, cantidad) {
  const imagenPrincipal =
    producto.imagenes?.find((imagen) => imagen.esPrincipal)?.url ||
    producto.imagenes?.find((imagen) => imagen.tipo !== "oferta_wide")?.url ||
    producto.imagenes?.[0]?.url ||
    "/img/productos/producto.png";

  return {
    id: producto.id,
    nombre: producto.nombre,
    marca: producto.marca?.nombre || "Sin marca",
    imagen: imagenPrincipal,
    precio: producto.precio,
    precioNormal: producto.precioNormal || producto.precio,
    descuento: producto.enOferta ? producto.descuento || 0 : 0,
    cantidad,
    stockNumero: producto.stock,
  };
}

function Checkout() {
  const navigate = useNavigate();
  const { usuario, token, estaLogueado, cargandoAuth } = useAuth();

  const [productosCheckout, setProductosCheckout] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [cargandoCheckout, setCargandoCheckout] = useState(true);

  const [mediosPago, setMediosPago] = useState([]);
  const [cargandoMediosPago, setCargandoMediosPago] = useState(false);
  const [medioPagoSeleccionadoId, setMedioPagoSeleccionadoId] = useState("");

  const [procesandoCompra, setProcesandoCompra] = useState(false);

  const [despachoCalculado, setDespachoCalculado] = useState({
    codigo: "RETIRO",
    nombre: "Retiro en tienda",
    precio: 0,
  });

  const [cargandoDespacho, setCargandoDespacho] = useState(false);

  const [datos, setDatos] = useState({
    direccionId: "",
    tipoEntrega: "despacho",
    metodoPago: "webpay",
    documento: "boleta",
  });

  const [datosInvitado, setDatosInvitado] = useState({
    nombreCliente: "",
    emailCliente: "",
    telefonoCliente: "",
    direccionTexto: "",
    region: "",
    comuna: "",
  });

  const [datosFacturacion, setDatosFacturacion] = useState({
    rutFacturacion: "",
    razonSocialFacturacion: "",
    giroFacturacion: "",
    direccionFacturacion: "",
    comunaFacturacion: "",
    ciudadFacturacion: "",
  });

  const actualizarDatoFacturacion = (campo, valor) => {
    setDatosFacturacion((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const tieneDescuentoBienvenida =
    estaLogueado &&
    usuario?.descuentoBienvenidaDisponible === true &&
    usuario?.descuentoBienvenidaUsado === false;

  const actualizarCampo = (campo, valor) => {
    setDatos((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const actualizarDatoInvitado = (campo, valor) => {
    setDatosInvitado((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  useEffect(() => {
    const cargarCheckout = async () => {
      if (cargandoAuth) return;

      try {
        setCargandoCheckout(true);

        if (estaLogueado && token) {
          const [carritoData, direccionesData] = await Promise.all([
            obtenerCarrito(token),
            obtenerDirecciones(token),
          ]);

          const productosAdaptados = carritoData.items.map(adaptarItemCheckout);

          setProductosCheckout(productosAdaptados);
          setDirecciones(direccionesData);

          const direccionPrincipal =
            direccionesData.find((direccion) => direccion.principal) ||
            direccionesData[0];

          if (direccionPrincipal) {
            setDatos((prev) => ({
              ...prev,
              direccionId: direccionPrincipal.id,
            }));
          }

          return;
        }

        const carritoInvitado = obtenerCarritoInvitado();

        if (carritoInvitado.length === 0) {
          setProductosCheckout([]);
          return;
        }

        const productosAdaptados = await Promise.all(
          carritoInvitado.map(async (item) => {
            const producto = await obtenerProductoPorId(item.productoId);

            return adaptarProductoInvitadoCheckout(producto, item.cantidad);
          }),
        );

        setProductosCheckout(
          productosAdaptados.filter((producto) => producto.stockNumero > 0),
        );
      } catch (error) {
        message.error(error.message || "No se pudo cargar el checkout");
      } finally {
        setCargandoCheckout(false);
      }
    };

    cargarCheckout();
  }, [token, estaLogueado, cargandoAuth]);

  useEffect(() => {
    const cargarDespacho = async () => {
      if (cargandoAuth || cargandoCheckout) return;

      if (datos.tipoEntrega === "retiro") {
        setDespachoCalculado({
          codigo: "RETIRO",
          nombre: "Retiro en tienda",
          precio: 0,
        });
        return;
      }

      if (estaLogueado && token) {
        if (datos.tipoEntrega === "despacho" && !datos.direccionId) {
          setDespachoCalculado({
            codigo: "SIN_DIRECCION",
            nombre: "Selecciona una dirección",
            precio: 0,
          });
          return;
        }

        try {
          setCargandoDespacho(true);

          const despacho = await calcularDespacho(
            token,
            datos.tipoEntrega,
            datos.direccionId,
          );

          setDespachoCalculado(despacho);
        } catch (error) {
          message.error(error.message || "No se pudo calcular el despacho");
        } finally {
          setCargandoDespacho(false);
        }

        return;
      }

      const regionInvitado = datosInvitado.region.trim();
      const comunaInvitado = datosInvitado.comuna.trim();

      if (!regionInvitado || !comunaInvitado) {
        setDespachoCalculado({
          codigo: "SIN_REGION_COMUNA",
          nombre: "Ingresa región y comuna",
          precio: 0,
        });
        return;
      }

      try {
        setCargandoDespacho(true);

        const despacho = await calcularDespacho(null, datos.tipoEntrega, null, {
          region: regionInvitado,
          comuna: comunaInvitado,
        });

        setDespachoCalculado(despacho);
      } catch (error) {
        setDespachoCalculado({
          codigo: "ERROR_DESPACHO",
          nombre: "No se pudo calcular el despacho",
          precio: 0,
        });

        message.error(error.message || "No se pudo calcular el despacho");
      } finally {
        setCargandoDespacho(false);
      }
    };

    cargarDespacho();
  }, [
    token,
    estaLogueado,
    datos.tipoEntrega,
    datos.direccionId,
    datosInvitado.region,
    datosInvitado.comuna,
    cargandoAuth,
    cargandoCheckout,
  ]);

  useEffect(() => {
    const cargarMediosPago = async () => {
      if (!token || !estaLogueado) return;

      try {
        setCargandoMediosPago(true);

        const data = await obtenerMediosPago(token);
        setMediosPago(data);

        const principal = data.find((medio) => medio.principal) || data[0];

        if (principal) {
          setMedioPagoSeleccionadoId(String(principal.id));
        }
      } catch (error) {
        message.error(
          error.message || "No se pudieron cargar los medios de pago",
        );
      } finally {
        setCargandoMediosPago(false);
      }
    };

    cargarMediosPago();
  }, [token, estaLogueado]);

  const resumen = useMemo(() => {
    const subtotal = productosCheckout.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0,
    );

    const descuentoBienvenida = tieneDescuentoBienvenida
      ? Math.round(subtotal * 0.03)
      : 0;

    const despacho = despachoCalculado?.precio || 0;

    const total = subtotal - descuentoBienvenida + despacho;

    const neto = Math.round(total / 1.19);
    const iva = total - neto;

    return {
      subtotal,
      descuentoBienvenida,
      descuento: descuentoBienvenida,
      despacho,
      neto,
      iva,
      total,
      cantidadProductos: productosCheckout.reduce(
        (total, producto) => total + producto.cantidad,
        0,
      ),
    };
  }, [productosCheckout, tieneDescuentoBienvenida, despachoCalculado]);

  const redirigirAWebpay = ({ url, token }) => {
    const form = document.createElement("form");

    form.method = "POST";
    form.action = url;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "token_ws";
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);

    form.submit();
  };

  const obtenerPayloadMercadoPago = (respuesta) => {
  if (!respuesta) return {};

  if (respuesta.data?.data) {
    return respuesta.data.data;
  }

  if (respuesta.data) {
    return respuesta.data;
  }

  return respuesta;
};

const obtenerUrlPagoMercadoPago = (respuesta) => {
  const payload = obtenerPayloadMercadoPago(respuesta);

  return (
    payload.urlPago ||
    payload.url ||
    payload.initPoint ||
    payload.init_point ||
    payload.sandboxInitPoint ||
    payload.sandbox_init_point ||
    null
  );
};

  const finalizarCompra = async () => {
    if (productosCheckout.length === 0) {
      message.warning("Tu carrito está vacío");
      navigate("/carrito");
      return;
    }

    if (
      estaLogueado &&
      datos.tipoEntrega === "despacho" &&
      !datos.direccionId
    ) {
      message.warning("Selecciona una dirección de despacho");
      return;
    }

    if (!estaLogueado) {
      if (!datosInvitado.nombreCliente.trim()) {
        message.warning("Ingresa tu nombre completo");
        return;
      }

      if (!datosInvitado.emailCliente.trim()) {
        message.warning("Ingresa tu correo electrónico");
        return;
      }

      if (
        datos.tipoEntrega === "despacho" &&
        (!datosInvitado.direccionTexto.trim() ||
          !datosInvitado.region.trim() ||
          !datosInvitado.comuna.trim())
      ) {
        message.warning("Ingresa dirección, región y comuna de despacho");
        return;
      }
    }

    if (datos.documento === "factura") {
      const datosFacturaCompletos =
        datosFacturacion.rutFacturacion.trim() &&
        datosFacturacion.razonSocialFacturacion.trim() &&
        datosFacturacion.giroFacturacion.trim() &&
        datosFacturacion.direccionFacturacion.trim() &&
        datosFacturacion.comunaFacturacion.trim() &&
        datosFacturacion.ciudadFacturacion.trim();

      if (!datosFacturaCompletos) {
        message.warning("Completa todos los datos de facturación");
        return;
      }
    }

    if (datos.metodoPago === "oneclick" && !medioPagoSeleccionadoId) {
      message.warning("Selecciona una tarjeta guardada");
      return;
    }

    try {
      setProcesandoCompra(true);

      const payloadPedido = {
        direccionId:
          estaLogueado && datos.tipoEntrega === "despacho"
            ? Number(datos.direccionId)
            : null,

        tipoEntrega: datos.tipoEntrega,
        metodoPago: datos.metodoPago,
        documento: datos.documento,

        ...(!estaLogueado
          ? {
              nombreCliente: datosInvitado.nombreCliente.trim(),
              emailCliente: datosInvitado.emailCliente.trim(),
              telefonoCliente: datosInvitado.telefonoCliente.trim() || null,
              direccionTexto:
                datos.tipoEntrega === "despacho"
                  ? datosInvitado.direccionTexto.trim()
                  : null,
              region:
                datos.tipoEntrega === "despacho"
                  ? datosInvitado.region.trim() || null
                  : null,
              comuna:
                datos.tipoEntrega === "despacho"
                  ? datosInvitado.comuna.trim()
                  : null,
              items: productosCheckout.map((producto) => ({
                productoId: producto.id,
                cantidad: producto.cantidad,
              })),
            }
          : {}),

        ...(datos.documento === "factura"
          ? {
              rutFacturacion: datosFacturacion.rutFacturacion.trim(),

              razonSocialFacturacion:
                datosFacturacion.razonSocialFacturacion.trim(),

              giroFacturacion: datosFacturacion.giroFacturacion.trim(),

              direccionFacturacion:
                datosFacturacion.direccionFacturacion.trim(),

              comunaFacturacion: datosFacturacion.comunaFacturacion.trim(),

              ciudadFacturacion: datosFacturacion.ciudadFacturacion.trim(),
            }
          : {}),
      };

      const pedido = await crearPedido(token, payloadPedido);

      if (datos.metodoPago === "webpay") {
        message.loading("Redirigiendo a Webpay...", 1.5);

        const pago = await crearPagoWebpay(token, pedido.id);

        redirigirAWebpay({
          url: pago.url,
          token: pago.token,
        });

        return;
      }

      if (datos.metodoPago === "oneclick") {
        message.loading("Procesando pago con tarjeta guardada...", 1.5);

        await crearPagoOneclick(
          token,
          pedido.id,
          Number(medioPagoSeleccionadoId),
        );

        message.success("Pago aprobado correctamente");

        navigate(`/compra-exitosa?pedidoId=${pedido.id}`, {
          state: {
            pedidoId: pedido.id,
            numero: pedido.numero,
          },
        });

        return;
      }

      if (datos.metodoPago === "mercadopago") {
        message.loading("Redirigiendo a Mercado Pago...", 1.5);

        const respuestaPago = await crearPagoMercadoPago(token, pedido.id);

        const urlPago = obtenerUrlPagoMercadoPago(respuestaPago);

        if (!urlPago) {
          throw new Error("Mercado Pago no devolvió una URL de pago");
        }

        if (!estaLogueado) {
          vaciarCarritoInvitado();
        }

        window.location.assign(urlPago);

        return;
      }

      message.success("Compra generada correctamente");

      navigate(`/compra-exitosa?pedidoId=${pedido.id}`, {
        state: {
          pedidoId: pedido.id,
          numero: pedido.numero,
        },
      });
    } catch (error) {
      message.error(error.message || "No se pudo finalizar la compra");
    } finally {
      setProcesandoCompra(false);
    }
  };

  if (cargandoAuth || cargandoCheckout) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Cargando checkout...
          </h1>

          <p className="text-gray-600 mt-2">
            Estamos preparando el resumen de tu compra.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/carrito" className="text-blue-600 hover:underline">
            Carrito
          </Link>
          <span className="mx-2">/</span>
          <span>Checkout</span>
        </div>

        <div className="mb-6">
          <Link
            to="/carrito"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-black"
          >
            <ArrowLeftOutlined />
            Volver al carrito
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <section className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                Finalizar compra
              </h1>

              <p className="text-gray-600 mt-1">
                Completa tus datos para continuar con el pedido.
              </p>
            </div>

            {/* Datos de contacto */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <UserOutlined className="text-2xl text-gray-900" />

                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Datos de contacto
                  </h2>

                  {!estaLogueado && (
                    <p className="text-sm text-gray-600 mt-1">
                      Puedes comprar como invitado. Usaremos estos datos para el
                      pedido.
                    </p>
                  )}
                </div>
              </div>

              {estaLogueado ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Nombre completo
                    </p>

                    <p className="mt-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      {usuario?.nombre || "No registrado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Correo electrónico
                    </p>

                    <p className="mt-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      {usuario?.email || "No registrado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-800">Teléfono</p>

                    <p className="mt-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      {usuario?.telefono || "No registrado"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Documento
                    </label>

                    <Select
                      size="large"
                      value={datos.documento}
                      onChange={(value) => actualizarCampo("documento", value)}
                      className="!h-12 !mt-2 w-full"
                      options={[
                        {
                          value: "boleta",
                          label: "Comprobante de compra",
                        },
                        
                      ]}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Nombre completo
                    </label>

                    <Input
                      size="large"
                      placeholder="Ej: Juan Pérez"
                      prefix={<UserOutlined className="text-gray-400" />}
                      value={datosInvitado.nombreCliente}
                      onChange={(e) =>
                        actualizarDatoInvitado("nombreCliente", e.target.value)
                      }
                      className="!h-12 !mt-2 !rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Correo electrónico
                    </label>

                    <Input
                      size="large"
                      type="email"
                      placeholder="Ej: correo@ejemplo.cl"
                      prefix={<MailOutlined className="text-gray-400" />}
                      value={datosInvitado.emailCliente}
                      onChange={(e) =>
                        actualizarDatoInvitado("emailCliente", e.target.value)
                      }
                      className="!h-12 !mt-2 !rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Teléfono
                    </label>

                    <Input
                      size="large"
                      placeholder="Ej: +56912345678"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      value={datosInvitado.telefonoCliente}
                      onChange={(e) =>
                        actualizarDatoInvitado(
                          "telefonoCliente",
                          e.target.value,
                        )
                      }
                      className="!h-12 !mt-2 !rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Documento
                    </label>

                    <Select
                      size="large"
                      value={datos.documento}
                      onChange={(value) => actualizarCampo("documento", value)}
                      className="!h-12 !mt-2 w-full"
                      options={[
                        {
                          value: "boleta",
                          label: "Comprobante de compra",
                        },
                        {
                          value: "factura",
                          label: "Factura proforma (no tributaria)",
                        },
                      ]}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Datos de facturación */}
            {datos.documento === "factura" && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-gray-900">
                    Datos de facturación
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    Estos datos aparecerán en la factura proforma. Este
                    documento no tiene validez tributaria ante el SII.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      RUT empresa
                    </label>

                    <Input
                      size="large"
                      placeholder="Ej: 76.123.456-7"
                      value={datosFacturacion.rutFacturacion}
                      onChange={(e) =>
                        actualizarDatoFacturacion(
                          "rutFacturacion",
                          e.target.value,
                        )
                      }
                      className="!h-12 !mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Razón social
                    </label>

                    <Input
                      size="large"
                      placeholder="Ej: Empresa Tecnológica SpA"
                      value={datosFacturacion.razonSocialFacturacion}
                      onChange={(e) =>
                        actualizarDatoFacturacion(
                          "razonSocialFacturacion",
                          e.target.value,
                        )
                      }
                      className="!h-12 !mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Giro
                    </label>

                    <Input
                      size="large"
                      placeholder="Ej: Venta de productos tecnológicos"
                      value={datosFacturacion.giroFacturacion}
                      onChange={(e) =>
                        actualizarDatoFacturacion(
                          "giroFacturacion",
                          e.target.value,
                        )
                      }
                      className="!h-12 !mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Dirección comercial
                    </label>

                    <Input
                      size="large"
                      placeholder="Ej: Avenida Principal 1234"
                      value={datosFacturacion.direccionFacturacion}
                      onChange={(e) =>
                        actualizarDatoFacturacion(
                          "direccionFacturacion",
                          e.target.value,
                        )
                      }
                      className="!h-12 !mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Comuna
                    </label>

                    <Input
                      size="large"
                      placeholder="Ej: Santiago"
                      value={datosFacturacion.comunaFacturacion}
                      onChange={(e) =>
                        actualizarDatoFacturacion(
                          "comunaFacturacion",
                          e.target.value,
                        )
                      }
                      className="!h-12 !mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-800">
                      Ciudad
                    </label>

                    <Input
                      size="large"
                      placeholder="Ej: Santiago"
                      value={datosFacturacion.ciudadFacturacion}
                      onChange={(e) =>
                        actualizarDatoFacturacion(
                          "ciudadFacturacion",
                          e.target.value,
                        )
                      }
                      className="!h-12 !mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Método de entrega */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <TruckOutlined className="text-2xl text-gray-900" />

                <h2 className="text-2xl font-black text-gray-900">
                  Método de entrega
                </h2>
              </div>

              <Radio.Group
                value={datos.tipoEntrega}
                onChange={(e) => actualizarCampo("tipoEntrega", e.target.value)}
                className="w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`border rounded-2xl p-5 cursor-pointer transition ${
                      datos.tipoEntrega === "despacho"
                        ? "border-gray-950 bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Radio value="despacho">
                      <span className="font-black text-gray-900">
                        Despacho a domicilio
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Recibe tu pedido en la dirección que indiques.
                    </p>
                  </label>

                  <label
                    className={`border rounded-2xl p-5 cursor-pointer transition ${
                      datos.tipoEntrega === "retiro"
                        ? "border-gray-950 bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Radio value="retiro">
                      <span className="font-black text-gray-900">
                        Retiro en tienda
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Retira tu compra cuando esté disponible.
                    </p>
                  </label>
                </div>
              </Radio.Group>

              {datos.tipoEntrega === "despacho" && (
                <div className="mt-6">
                  {estaLogueado ? (
                    <>
                      <label className="text-sm font-bold text-gray-800">
                        Dirección de despacho
                      </label>

                      <Select
                        size="large"
                        placeholder="Selecciona una dirección guardada"
                        value={datos.direccionId || undefined}
                        onChange={(value) =>
                          actualizarCampo("direccionId", value)
                        }
                        className="!h-12 !mt-2 w-full"
                        options={direcciones.map((direccion) => ({
                          value: direccion.id,
                          label: `${direccion.direccion} - ${direccion.comuna}`,
                        }))}
                      />

                      {direcciones.length === 0 && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-sm text-amber-800 font-bold">
                            No tienes direcciones guardadas.
                          </p>

                          <Link
                            to="/mi-cuenta"
                            className="text-sm font-bold underline text-amber-900"
                          >
                            Agregar dirección en Mi cuenta
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <label className="text-sm font-bold text-gray-800">
                        Dirección de despacho
                      </label>

                      <p className="text-sm text-gray-600 mt-1 mb-4">
                        Ingresa la dirección donde quieres recibir tu pedido.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <Input
                            size="large"
                            placeholder="Ej: Av. Providencia 1234, depto 501"
                            value={datosInvitado.direccionTexto}
                            onChange={(e) =>
                              actualizarDatoInvitado(
                                "direccionTexto",
                                e.target.value,
                              )
                            }
                            className="!h-12 !rounded-xl"
                          />
                        </div>

                        <div>
                          <Input
                            size="large"
                            placeholder="Comuna"
                            value={datosInvitado.comuna}
                            onChange={(e) =>
                              actualizarDatoInvitado("comuna", e.target.value)
                            }
                            className="!h-12 !rounded-xl"
                          />
                        </div>

                        <div>
                          <Select
                            size="large"
                            placeholder="Selecciona región"
                            value={datosInvitado.region || undefined}
                            onChange={(value) =>
                              actualizarDatoInvitado("region", value)
                            }
                            options={OPCIONES_REGIONES}
                            className="!h-12 w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Método de pago */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCardOutlined className="text-2xl text-gray-900" />

                <h2 className="text-2xl font-black text-gray-900">
                  Método de pago
                </h2>
              </div>

              <Radio.Group
                value={datos.metodoPago}
                onChange={(e) => actualizarCampo("metodoPago", e.target.value)}
                className="w-full"
              >
                <div className="space-y-4">
                  {/* Webpay */}
                  <label
                    className={`block border rounded-2xl p-5 cursor-pointer transition ${
                      datos.metodoPago === "webpay"
                        ? "border-gray-950 bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Radio value="webpay">
                      <span className="font-black text-gray-900">
                        Webpay / Tarjeta
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Pago con tarjeta de débito o crédito mediante Webpay.
                    </p>
                  </label>

                  {estaLogueado && (
                    <>
                      {/* Oneclick */}
                      <label
                        className={`block border rounded-2xl p-5 transition ${
                          datos.metodoPago === "oneclick"
                            ? "border-gray-950 bg-gray-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        } ${
                          mediosPago.length === 0
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <Radio
                          value="oneclick"
                          disabled={mediosPago.length === 0}
                        >
                          <span className="font-black text-gray-900">
                            Tarjeta guardada / Oneclick
                          </span>
                        </Radio>

                        <p className="text-sm text-gray-600 mt-2 ml-6">
                          Paga con una tarjeta previamente inscrita en Transbank
                          Oneclick.
                        </p>

                        {cargandoMediosPago && (
                          <p className="text-xs text-gray-500 font-bold mt-2 ml-6">
                            Cargando tarjetas guardadas...
                          </p>
                        )}

                        {!cargandoMediosPago && mediosPago.length === 0 && (
                          <p className="text-xs text-orange-600 font-bold mt-2 ml-6">
                            No tienes tarjetas guardadas. Agrégala desde Mi
                            cuenta → Medios de pago.
                          </p>
                        )}

                        {datos.metodoPago === "oneclick" &&
                          mediosPago.length > 0 && (
                            <div className="mt-4 ml-6">
                              <Select
                                size="large"
                                value={medioPagoSeleccionadoId || undefined}
                                onChange={(value) =>
                                  setMedioPagoSeleccionadoId(String(value))
                                }
                                className="w-full"
                                options={mediosPago.map((medio) => ({
                                  value: String(medio.id),
                                  label: `${medio.tipoTarjeta || "Tarjeta"}${
                                    medio.ultimos4
                                      ? ` terminada en ${medio.ultimos4}`
                                      : ""
                                  }`,
                                }))}
                              />
                            </div>
                          )}
                      </label>
                    </>
                  )}

                  {/* Mercado Pago */}
                  <label
                    className={`block border rounded-2xl p-5 cursor-pointer transition ${
                      datos.metodoPago === "mercadopago"
                        ? "border-gray-950 bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Radio value="mercadopago">
                      <span className="font-black text-gray-900">
                        Mercado Pago
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Paga de forma segura con Mercado Pago.
                    </p>
                  </label>
                </div>
              </Radio.Group>
            </div>
          </section>

          {/* Resumen */}

          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-black text-gray-900 mb-5">
                Resumen del pedido
              </h2>
              {tieneDescuentoBienvenida && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <p className="text-sm font-bold text-emerald-700">
                    Tienes 3% de descuento de bienvenida activo.
                  </p>
                </div>
              )}
              <div className="space-y-4 mb-5">
                {productosCheckout.map((producto) => (
                  <div key={producto.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center p-2">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-black text-gray-900">
                        {producto.marca}
                      </p>

                      <p className="text-xs text-gray-600 line-clamp-2">
                        {producto.nombre}
                      </p>

                      <p className="text-sm font-black mt-1">
                        {formatearPrecio(producto.precio)}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-gray-500">
                      x{producto.cantidad}
                    </span>
                  </div>
                ))}
              </div>

              <Divider />
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">
                    Productos ({resumen.cantidadProductos})
                  </span>

                  <span className="font-bold">
                    {formatearPrecio(resumen.subtotal)}
                  </span>
                </div>

                {resumen.descuentoBienvenida > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">
                      Descuento bienvenida 3%
                    </span>

                    <span className="font-bold text-emerald-600">
                      -{formatearPrecio(resumen.descuentoBienvenida)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">Despacho</span>
                  <span className="font-bold text-emerald-600">
                    {cargandoDespacho
                      ? "Calculando..."
                      : datos.tipoEntrega === "despacho" &&
                          despachoCalculado?.codigo === "SIN_REGION_COMUNA"
                        ? "Pendiente"
                        : estaLogueado &&
                            datos.tipoEntrega === "despacho" &&
                            !datos.direccionId
                          ? "Pendiente"
                          : resumen.despacho === 0
                            ? "Gratis"
                            : formatearPrecio(resumen.despacho)}
                  </span>
                  {despachoCalculado?.nombre && (
                    <p className="text-xs text-gray-500 text-right">
                      {despachoCalculado.nombre}
                    </p>
                  )}
                </div>
              </div>

              <Divider />

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-bold text-gray-600">Total</p>

                  <p className="text-xs text-gray-500">
                    Neto: {formatearPrecio(resumen.neto)}
                  </p>

                  <p className="text-xs text-gray-500">
                    IVA incluido 19%: {formatearPrecio(resumen.iva)}
                  </p>
                </div>

                <p className="text-3xl font-black text-gray-950">
                  {formatearPrecio(resumen.total)}
                </p>
              </div>

              <Button
                block
                size="large"
                loading={procesandoCompra}
                disabled={productosCheckout.length === 0}
                onClick={finalizarCompra}
                className="!h-14 !mt-6 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black hover:!bg-black disabled:!bg-gray-300"
              >
                {datos.metodoPago === "mercadopago"
                  ? "Pagar con Mercado Pago"
                  : datos.metodoPago === "webpay"
                    ? "Pagar con Webpay"
                    : datos.metodoPago === "oneclick"
                      ? "Pagar con tarjeta guardada"
                      : "Finalizar compra"}
              </Button>

              <div className="mt-5 flex gap-2 text-sm text-gray-600">
                <CheckCircleOutlined className="text-emerald-500 mt-1" />

                <p>
                  Tu pedido se generará de forma segura. Si eliges un método de
                  pago en línea, el pago será procesado mediante la pasarela
                  correspondiente.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Checkout;
