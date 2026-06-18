import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input, Steps, message } from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  HomeOutlined,
  MailOutlined,
  FileTextOutlined,
  CustomerServiceOutlined,
  ShoppingOutlined,
  InboxOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { obtenerPedidoPorId, obtenerPedidos } from "../services/api";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function formatearFecha(fecha) {
  if (!fecha) return "Fecha no disponible";

  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearFechaHora(fecha) {
  if (!fecha) return "Fecha no disponible";

  return new Date(fecha).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const pasosSeguimiento = [
  {
    estado: "pendiente",
    title: "Recibido",
    descripcion: "Pedido recibido",
    icon: <CheckCircleOutlined />,
  },
  {
    estado: "confirmado",
    title: "Pago",
    descripcion: "Pago confirmado",
    icon: <DollarOutlined />,
  },
  {
    estado: "preparando",
    title: "Preparando",
    descripcion: "Preparando productos",
    icon: <ClockCircleOutlined />,
  },
  {
    estado: "empaquetando",
    title: "Empaque",
    descripcion: "Empaquetando pedido",
    icon: <InboxOutlined />,
  },
  {
    estado: "en_despacho",
    title: "En camino",
    descripcion: "Pedido en despacho",
    icon: <TruckOutlined />,
  },
  {
    estado: "entregado",
    title: "Entregado",
    descripcion: "Pedido entregado",
    icon: <HomeOutlined />,
  },
];

const obtenerTextoEstado = (estado) => {
  const textos = {
    pendiente: "Pedido recibido",
    confirmado: "Pago confirmado",
    preparando: "Preparando productos",
    empaquetando: "Empaquetando pedido",
    en_despacho: "Pedido en despacho",
    entregado: "Pedido entregado",
    cancelado: "Pedido cancelado",
  };

  return textos[estado] || "Estado del pedido";
};

const obtenerDetalleEstado = (estado) => {
  const detalles = {
    pendiente: "Recibimos tu pedido correctamente.",
    confirmado: "El pago fue confirmado y el pedido continuará su proceso.",
    preparando: "Estamos preparando los productos de tu pedido.",
    empaquetando: "Tu pedido está siendo empaquetado para el despacho.",
    en_despacho: "Tu pedido ya salió a despacho.",
    entregado: "Tu pedido fue entregado correctamente.",
    cancelado: "El pedido fue cancelado.",
  };

  return detalles[estado] || "Tu pedido se encuentra en proceso.";
};

const formatearMetodoPago = (metodo) => {
  const metodos = {
    transferencia: "Transferencia bancaria",
    webpay: "Webpay / Tarjeta",
    mercadopago: "Mercado Pago",
  };

  return metodos[metodo] || metodo || "No informado";
};

const formatearEstadoPago = (estadoPago) => {
  const estados = {
    pendiente: "Pendiente",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
    cancelado: "Cancelado",
  };

  return estados[estadoPago] || "Pendiente";
};

const formatearTipoEntrega = (tipo) => {
  if (tipo === "retiro") return "Retiro en tienda";
  return "Despacho a domicilio";
};

function SeguimientoCompra() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pedidoIdUrl = searchParams.get("pedidoId");

  const { token, estaLogueado, cargandoAuth } = useAuth();

  const [numeroPedido, setNumeroPedido] = useState("");
  const [correo, setCorreo] = useState("");
  const [pedido, setPedido] = useState(null);
  const [cargandoPedido, setCargandoPedido] = useState(false);
  const [buscandoPedido, setBuscandoPedido] = useState(false);

  useEffect(() => {
    const cargarPedidoDesdeUrl = async () => {
      if (cargandoAuth) return;

      if (!estaLogueado || !token) {
        message.info("Inicia sesión para revisar el seguimiento de tu compra");
        navigate("/login");
        return;
      }

      if (!pedidoIdUrl) return;

      try {
        setCargandoPedido(true);

        const data = await obtenerPedidoPorId(token, pedidoIdUrl);
        setPedido(data);
      } catch (error) {
        message.error(error.message || "No se pudo cargar el pedido");
      } finally {
        setCargandoPedido(false);
      }
    };

    cargarPedidoDesdeUrl();
  }, [pedidoIdUrl, token, estaLogueado, cargandoAuth, navigate]);

  const buscarPedido = async () => {
    if (!numeroPedido.trim()) {
      message.warning("Ingresa el número de pedido");
      return;
    }

    if (!correo.trim() || !correo.includes("@")) {
      message.warning("Ingresa un correo válido");
      return;
    }

    if (!estaLogueado || !token) {
      message.info("Inicia sesión para buscar tus pedidos");
      navigate("/login");
      return;
    }

    try {
      setBuscandoPedido(true);

      const pedidos = await obtenerPedidos(token);

      const pedidoEncontrado = pedidos.find(
        (item) =>
          item.numero.toLowerCase() === numeroPedido.trim().toLowerCase() &&
          item.emailCliente.toLowerCase() === correo.trim().toLowerCase(),
      );

      if (!pedidoEncontrado) {
        message.warning("No encontramos un pedido con esos datos");
        return;
      }

      setPedido(pedidoEncontrado);
      message.success("Pedido encontrado");
    } catch (error) {
      message.error(error.message || "No se pudo buscar el pedido");
    } finally {
      setBuscandoPedido(false);
    }
  };

  const pasoActual = useMemo(() => {
    if (!pedido) return 0;

    if (pedido.estado === "cancelado") return 0;

    const indice = pasosSeguimiento.findIndex(
      (paso) => paso.estado === pedido.estado,
    );

    return indice >= 0 ? indice : 0;
  }, [pedido]);

  const estadosRegistrados = useMemo(() => {
    if (!pedido?.seguimientos) return [];

    return pedido.seguimientos.map((item) => item.estado);
  }, [pedido]);

  const mostrarBuscador = !pedidoIdUrl && !pedido;

  if (cargandoAuth || cargandoPedido) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Cargando seguimiento...
          </h1>

          <p className="text-gray-600 mt-2">
            Estamos obteniendo el estado actualizado de tu pedido.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="text-sm text-gray-500 mb-8">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span>Seguimiento de compra</span>
        </div>

        <section className="bg-gray-950 text-white rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden mb-10">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

          <div
            className={`relative grid grid-cols-1 ${
              mostrarBuscador ? "lg:grid-cols-[1fr_420px]" : ""
            } gap-8 items-center`}
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 mb-5">
                <TruckOutlined className="text-emerald-400" />

                <span className="text-sm font-bold">Seguimiento de compra</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black leading-tight">
                {pedido
                  ? `Estado del pedido ${pedido.numero}`
                  : "Revisa el estado de tu pedido"}
              </h1>

              <p className="text-gray-300 mt-4 max-w-2xl leading-relaxed">
                {pedido
                  ? "Consulta el avance de tu compra, el historial del pedido y el resumen de entrega."
                  : "Ingresa tu número de pedido y correo electrónico para consultar el estado de tu compra en Econnet."}
              </p>
            </div>

            {mostrarBuscador && (
              <div className="bg-white rounded-3xl p-6 shadow-sm text-gray-900">
                <h2 className="text-xl font-black mb-4">Buscar pedido</h2>

                <div className="space-y-4">
                  <Input
                    size="large"
                    placeholder="Ej: EC-2026-0001"
                    prefix={<FileTextOutlined className="text-gray-400" />}
                    value={numeroPedido}
                    onChange={(e) => setNumeroPedido(e.target.value)}
                    className="!h-13 !rounded-xl"
                  />

                  <Input
                    size="large"
                    placeholder="Correo usado en la compra"
                    prefix={<MailOutlined className="text-gray-400" />}
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="!h-13 !rounded-xl"
                  />

                  <Button
                    block
                    size="large"
                    loading={buscandoPedido}
                    onClick={buscarPedido}
                    className="!h-13 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black hover:!bg-black"
                  >
                    Buscar pedido
                  </Button>

                  <p className="text-xs text-gray-500">
                    También puedes entrar desde Mi cuenta → Mis pedidos → Ver
                    seguimiento.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {pedido ? (
          <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">
                      Pedido {pedido.numero}
                    </h2>

                    <p className="text-gray-600 mt-1">
                      Compra realizada el {formatearFecha(pedido.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`w-fit text-sm font-black px-4 py-2 rounded-full ${
                      pedido.estado === "cancelado"
                        ? "text-red-700 bg-red-100"
                        : "text-emerald-700 bg-emerald-100"
                    }`}
                  >
                    {obtenerTextoEstado(pedido.estado)}
                  </span>
                </div>

                <div className="overflow-x-auto pb-3">
                  <Steps
                    className="min-w-[850px]"
                    current={pasoActual}
                    status={pedido.estado === "cancelado" ? "error" : "process"}
                    items={pasosSeguimiento.map((paso, index) => ({
                      title: (
                        <span className="whitespace-nowrap text-sm">
                          {paso.title}
                        </span>
                      ),
                      icon:
                        estadosRegistrados.includes(paso.estado) ||
                        index <= pasoActual ? (
                          paso.icon
                        ) : (
                          <ClockCircleOutlined />
                        ),
                    }))}
                  />
                </div>

                <div className="mt-8 bg-gray-100 rounded-2xl p-5">
                  <p className="text-sm font-bold text-gray-900">
                    Estado actual
                  </p>

                  <p className="text-gray-700 mt-1">
                    {obtenerDetalleEstado(pedido.estado)}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-5">
                  Historial del seguimiento
                </h2>

                {pedido.seguimientos?.length > 0 ? (
                  <div className="space-y-4">
                    {pedido.seguimientos.map((item) => (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-2xl p-4"
                      >
                        <p className="font-black text-gray-900">
                          {item.titulo}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {item.detalle}
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                          {formatearFechaHora(item.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Este pedido todavía no tiene movimientos registrados.
                  </p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 md:p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-5">
                  Productos del pedido
                </h2>

                <div className="space-y-4">
                  {pedido.items?.map((producto) => (
                    <div
                      key={producto.id}
                      className="flex gap-4 border border-gray-200 rounded-2xl p-4"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center p-2">
                        <img
                          src={
                            producto.imagenUrl || "/img/productos/producto.png"
                          }
                          alt={producto.nombreProducto}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/img/productos/producto.png";
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-black text-gray-900">
                          {producto.marcaProducto || "Econnet"}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {producto.nombreProducto}
                        </p>

                        <p className="text-xs text-gray-500 mt-2">
                          Cantidad: {producto.cantidad}
                        </p>

                        <p className="text-sm font-black text-gray-900 mt-2">
                          {formatearPrecio(producto.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
                <h2 className="text-xl font-black text-gray-900 mb-5">
                  Resumen
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Subtotal</span>

                    <span className="font-black">
                      {formatearPrecio(pedido.subtotal)}
                    </span>
                  </div>

                  {pedido.descuento > 0 && (
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-700">Descuento</span>

                      <span className="font-black text-emerald-600">
                        -{formatearPrecio(pedido.descuento)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Despacho</span>

                    <span className="font-black">
                      {pedido.despacho > 0
                        ? formatearPrecio(pedido.despacho)
                        : "Gratis"}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="font-bold text-gray-700">Total</span>

                    <span className="font-black">
                      {formatearPrecio(pedido.total)}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-gray-700">Estado de pago</p>

                    <p
                      className={`font-bold mt-1 ${
                        pedido.estadoPago === "aprobado"
                          ? "text-emerald-600"
                          : pedido.estadoPago === "rechazado" ||
                              pedido.estadoPago === "cancelado"
                            ? "text-red-600"
                            : "text-orange-600"
                      }`}
                    >
                      {formatearEstadoPago(pedido.estadoPago)}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-gray-700">Método de entrega</p>

                    <p className="text-gray-600 mt-1">
                      {formatearTipoEntrega(pedido.tipoEntrega)}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-gray-700">Dirección</p>

                    <p className="text-gray-600 mt-1">
                      {pedido.tipoEntrega === "retiro"
                        ? "Retiro en tienda Econnet"
                        : `${pedido.direccionTexto || ""}, ${
                            pedido.comuna || ""
                          }, ${pedido.region || ""}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 text-white rounded-3xl shadow-sm p-6">
                <CustomerServiceOutlined className="text-3xl text-emerald-400 mb-4" />

                <h3 className="text-xl font-black">¿Necesitas ayuda?</h3>

                <p className="text-sm text-gray-300 mt-2 mb-5">
                  Si tienes problemas con tu pedido, puedes escribirnos para
                  revisar el caso.
                </p>

                <Link to="/contacto">
                  <Button block className="!h-12 !rounded-xl !font-bold">
                    Contactar soporte
                  </Button>
                </Link>
              </div>
            </aside>
          </section>
        ) : (
          <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-center">
            <SearchOutlined className="text-5xl text-gray-300 mb-4" />

            <h2 className="text-2xl font-black text-gray-900">
              Ingresa los datos de tu compra
            </h2>

            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Para consultar el estado de tu pedido, usa el número de compra y
              el correo electrónico ingresado al momento de comprar.
            </p>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SeguimientoCompra;
