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
  obtenerDirecciones,
  obtenerPedidos,
  crearPedido,
  calcularDespacho,
} from "../services/api";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

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
    precioNormal: producto.precio,
    cantidad: item.cantidad,
  };
}

function Checkout() {
  const navigate = useNavigate();
  const { usuario, token, estaLogueado, cargandoAuth } = useAuth();

  const [productosCheckout, setProductosCheckout] = useState([]);
  const [direcciones, setDirecciones] = useState([]);
  const [cargandoCheckout, setCargandoCheckout] = useState(true);

  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [aplicaDescuentoNuevo, setAplicaDescuentoNuevo] = useState(false);
  const [despachoCalculado, setDespachoCalculado] = useState({
    codigo: "RETIRO",
    nombre: "Retiro en tienda",
    precio: 0,
  });

  const [cargandoDespacho, setCargandoDespacho] = useState(false);

  const [datos, setDatos] = useState({
    direccionId: "",
    tipoEntrega: "despacho",
    metodoPago: "transferencia",
    documento: "boleta",
  });

  const actualizarCampo = (campo, valor) => {
    setDatos((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  useEffect(() => {
    const cargarCheckout = async () => {
      if (cargandoAuth) return;

      if (!estaLogueado || !token) {
        message.info("Inicia sesión para finalizar tu compra");
        navigate("/login");
        return;
      }

      try {
        setCargandoCheckout(true);

        const [carritoData, direccionesData, pedidosData] = await Promise.all([
          obtenerCarrito(token),
          obtenerDirecciones(token),
          obtenerPedidos(token),
        ]);

        const productosAdaptados = carritoData.items.map(adaptarItemCheckout);

        setProductosCheckout(productosAdaptados);
        setDirecciones(direccionesData);
        setAplicaDescuentoNuevo(pedidosData.length === 0);

        const direccionPrincipal =
          direccionesData.find((direccion) => direccion.principal) ||
          direccionesData[0];

        if (direccionPrincipal) {
          setDatos((prev) => ({
            ...prev,
            direccionId: direccionPrincipal.id,
          }));
        }
      } catch (error) {
        message.error(error.message || "No se pudo cargar el checkout");
      } finally {
        setCargandoCheckout(false);
      }
    };

    cargarCheckout();
  }, [token, estaLogueado, cargandoAuth, navigate]);

  useEffect(() => {
    const cargarDespacho = async () => {
      if (!token || cargandoAuth || cargandoCheckout) return;

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
    };

    cargarDespacho();
  }, [
    token,
    datos.tipoEntrega,
    datos.direccionId,
    cargandoAuth,
    cargandoCheckout,
  ]);

  const resumen = useMemo(() => {
    const subtotal = productosCheckout.reduce(
      (total, producto) => total + producto.precioNormal * producto.cantidad,
      0,
    );

    const totalProductos = productosCheckout.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0,
    );

    const descuentoProductos = subtotal - totalProductos;

    const descuentoNuevoUsuario = aplicaDescuentoNuevo
      ? Math.round(totalProductos * 0.1)
      : 0;

    const despacho = despachoCalculado?.precio || 0;

    return {
      subtotal,
      descuentoProductos,
      descuentoNuevoUsuario,
      descuento: descuentoProductos + descuentoNuevoUsuario,
      despacho,
      total: totalProductos - descuentoNuevoUsuario + despacho,
      cantidadProductos: productosCheckout.reduce(
        (total, producto) => total + producto.cantidad,
        0,
      ),
    };
  }, [
    productosCheckout,
    datos.tipoEntrega,
    aplicaDescuentoNuevo,
    despachoCalculado,
  ]);

  const finalizarCompra = async () => {
    if (productosCheckout.length === 0) {
      message.warning("Tu carrito está vacío");
      navigate("/carrito");
      return;
    }

    if (datos.tipoEntrega === "despacho" && !datos.direccionId) {
      message.warning("Selecciona una dirección de despacho");
      return;
    }

    try {
      setProcesandoCompra(true);

      const pedido = await crearPedido(token, {
        direccionId:
          datos.tipoEntrega === "despacho" ? Number(datos.direccionId) : null,
        tipoEntrega: datos.tipoEntrega,
        metodoPago: datos.metodoPago,
        documento: datos.documento,
      });

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

                <h2 className="text-2xl font-black text-gray-900">
                  Datos de contacto
                </h2>
              </div>

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
                      { value: "boleta", label: "Boleta" },
                      { value: "factura", label: "Factura" },
                    ]}
                  />
                </div>
              </div>
            </div>

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
                  <label className="text-sm font-bold text-gray-800">
                    Dirección de despacho
                  </label>

                  <Select
                    size="large"
                    placeholder="Selecciona una dirección guardada"
                    value={datos.direccionId || undefined}
                    onChange={(value) => actualizarCampo("direccionId", value)}
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
                  <label
                    className={`block border rounded-2xl p-5 cursor-pointer transition ${
                      datos.metodoPago === "transferencia"
                        ? "border-gray-950 bg-gray-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Radio value="transferencia">
                      <span className="font-black text-gray-900">
                        Transferencia bancaria
                      </span>
                    </Radio>

                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      Recibirás los datos bancarios al confirmar el pedido.
                    </p>
                  </label>

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
                      Pago con tarjeta de débito o crédito. Integración
                      pendiente.
                    </p>
                  </label>

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
                      Opción preparada para futura integración.
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
              {aplicaDescuentoNuevo && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <p className="text-sm font-bold text-emerald-700">
                    Tienes 10% de descuento por ser tu primera compra.
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

                {resumen.descuentoProductos > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">
                      Descuentos productos
                    </span>

                    <span className="font-bold text-emerald-600">
                      -{formatearPrecio(resumen.descuentoProductos)}
                    </span>
                  </div>
                )}

                {aplicaDescuentoNuevo && resumen.descuentoNuevoUsuario > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-700">
                      Descuento primera compra 10%
                    </span>

                    <span className="font-bold text-emerald-600">
                      -{formatearPrecio(resumen.descuentoNuevoUsuario)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="font-bold text-gray-700">Despacho</span>
                  <span className="font-bold text-emerald-600">
                    {cargandoDespacho
                      ? "Calculando..."
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

                  <p className="text-xs text-gray-500">IVA incluido</p>
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
                Finalizar compra
              </Button>

              <div className="mt-5 flex gap-2 text-sm text-gray-600">
                <CheckCircleOutlined className="text-emerald-500 mt-1" />

                <p>
                  Esta es una simulación visual. El pago real se integrará más
                  adelante con backend.
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
