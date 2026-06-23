import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Alert, Button, Result, Tag, message } from "antd";
import {
  CheckCircleOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  TruckOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  obtenerPedidoPorId,
  obtenerSeguimientoPedidoInvitado,
  descargarDocumentoPedido,
  descargarDocumentoPedidoInvitado,
} from "../services/api";
import { vaciarCarritoInvitado } from "../utils/carritoInvitado";
function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function formatearFecha(fecha) {
  if (!fecha) return "No registrada";

  return new Date(fecha).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearMetodoPago(metodo) {
  const metodos = {
    transferencia: "Transferencia bancaria",
    webpay: "Webpay / Tarjeta",
    oneclick: "Tarjeta guardada / Oneclick",
    mercadopago: "Mercado Pago",
  };

  return metodos[metodo] || metodo || "No informado";
}

function formatearEstadoPago(estadoPago) {
  const estados = {
    pendiente: "Pendiente",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
    cancelado: "Cancelado",
  };

  return estados[estadoPago] || "Pendiente";
}

function obtenerColorEstadoPago(estadoPago) {
  const colores = {
    pendiente: "orange",
    aprobado: "green",
    rechazado: "red",
    cancelado: "volcano",
  };

  return colores[estadoPago] || "orange";
}

function obtenerAvisoPago(pedido) {
  if (pedido.metodoPago === "webpay" && pedido.estadoPago === "aprobado") {
    return {
      tipo: "success",
      titulo: "Pago aprobado correctamente",
      descripcion:
        "Tu pago fue confirmado por Webpay. Pronto comenzaremos a preparar tu pedido.",
    };
  }

  if (pedido.metodoPago === "oneclick" && pedido.estadoPago === "aprobado") {
    return {
      tipo: "success",
      titulo: "Pago aprobado correctamente",
      descripcion:
        "Tu pago fue confirmado con tu tarjeta guardada en Transbank Oneclick. Pronto comenzaremos a preparar tu pedido.",
    };
  }

  if (pedido.metodoPago === "transferencia") {
    return {
      tipo: "info",
      titulo: "Pedido generado, pago pendiente",
      descripcion:
        "Tu pedido fue recibido correctamente. Recuerda realizar la transferencia bancaria para que podamos confirmar el pago.",
    };
  }

  if (pedido.estadoPago === "pendiente") {
    return {
      tipo: "warning",
      titulo: "Pago pendiente",
      descripcion:
        "Tu pedido fue generado, pero el pago todavía no ha sido confirmado.",
    };
  }

  return null;
}

function formatearTipoEntrega(tipo) {
  if (tipo === "retiro") return "Retiro en tienda";
  return "Despacho a domicilio";
}

function CompraExitosa() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { token, estaLogueado, cargandoAuth } = useAuth();

  const pedidoId =
    searchParams.get("pedidoId") || location.state?.pedidoId || null;
  const ordenWebpay = searchParams.get("orden");

  const [pedido, setPedido] = useState(null);
  const [cargandoPedido, setCargandoPedido] = useState(true);
  const [descargandoDocumento, setDescargandoDocumento] = useState(false);

  useEffect(() => {
    const cargarPedido = async () => {
      if (cargandoAuth) return;

      if (!pedidoId) {
        setCargandoPedido(false);
        return;
      }

      try {
        setCargandoPedido(true);

        if (estaLogueado && token) {
          const data = await obtenerPedidoPorId(token, pedidoId);
          setPedido(data);
          return;
        }

        vaciarCarritoInvitado();

        if (!ordenWebpay) {
          setCargandoPedido(false);
          return;
        }

        const data = await obtenerSeguimientoPedidoInvitado(
          pedidoId,
          ordenWebpay,
        );

        setPedido(data);
      } catch (error) {
        message.error(error.message || "No se pudo cargar el pedido");
      } finally {
        setCargandoPedido(false);
      }
    };

    cargarPedido();
  }, [pedidoId, ordenWebpay, token, estaLogueado, cargandoAuth]);

  const handleDescargarDocumento = async () => {
    if (!pedido?.id) {
      message.warning("No se encontró el pedido");
      return;
    }

    try {
      setDescargandoDocumento(true);

      const { blob } = await descargarDocumentoPedido(token, pedido.id);

      const tipoDocumento = "Comprobante";

      const numeroPedido = String(pedido.numero || pedido.id).replace(
        /[^a-zA-Z0-9-_]/g,
        "_",
      );

      const nombreArchivo = `${tipoDocumento}-${numeroPedido}.pdf`;

      const urlTemporal = window.URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = urlTemporal;
      enlace.download = nombreArchivo;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      window.URL.revokeObjectURL(urlTemporal);

      message.success("Documento descargado correctamente");
    } catch (error) {
      message.error(error.message || "No se pudo descargar el documento");
    } finally {
      setDescargandoDocumento(false);
    }
  };

  const handleDescargarDocumentoInvitado = async () => {
    if (!pedidoId || !ordenWebpay) {
      message.warning("No se encontraron los datos del pedido");
      return;
    }

    try {
      setDescargandoDocumento(true);

      const { blob, nombreArchivo } = await descargarDocumentoPedidoInvitado(
        pedidoId,
        ordenWebpay,
      );

      const urlTemporal = window.URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = urlTemporal;
      enlace.download = nombreArchivo;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      window.URL.revokeObjectURL(urlTemporal);

      message.success("Documento descargado correctamente");
    } catch (error) {
      message.error(error.message || "No se pudo descargar el documento");
    } finally {
      setDescargandoDocumento(false);
    }
  };

  if (cargandoAuth || cargandoPedido) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-5xl mx-auto px-8 py-20 text-center">
          <h1 className="text-2xl font-black text-gray-900">
            Cargando compra...
          </h1>

          <p className="text-gray-600 mt-2">
            Estamos preparando el resumen de tu pedido.
          </p>
        </main>

        <Footer />
      </div>
    );
  }

  const esCompraInvitado = !estaLogueado || !token;

  if (!pedido) {
    if (esCompraInvitado && pedidoId) {
      return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
          <Navbar />

          <main className="max-w-5xl mx-auto px-8 py-12">
            <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="bg-gray-950 text-white px-8 py-10 text-center relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-emerald-400 text-gray-950 flex items-center justify-center mx-auto mb-5">
                    <CheckCircleOutlined className="text-4xl" />
                  </div>

                  <h1 className="text-4xl font-black">
                    Compra realizada correctamente
                  </h1>

                  <p className="text-gray-300 mt-3">
                    Gracias por comprar en Econnet. Hemos recibido tu pedido.
                  </p>
                </div>
              </div>

              <div className="p-8 md:p-10">
                <Result
                  status="success"
                  title="Tu pago fue aprobado con éxito"
                  subTitle={`Número de pedido: ${pedidoId}`}
                  extra={null}
                />

                <Alert
                  type="success"
                  message="Pago aprobado correctamente"
                  description="Tu compra fue confirmada. Te enviaremos la información del pedido al correo ingresado durante el checkout."
                  showIcon
                  className="!mb-6 !rounded-2xl"
                />

                {ordenWebpay && (
                  <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-black text-gray-900 mb-3">
                      Información Webpay
                    </h3>

                    <p className="text-sm text-gray-600">
                      <span className="font-bold">Orden: </span>
                      {ordenWebpay}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                  <Link to="/productos">
                    <Button
                      size="large"
                      className="!h-12 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black !px-8 hover:!bg-black"
                    >
                      Seguir comprando
                    </Button>
                  </Link>

                  <Button
                    size="large"
                    icon={<DownloadOutlined />}
                    loading={descargandoDocumento}
                    onClick={handleDescargarDocumentoInvitado}
                    className="!h-12 !rounded-2xl !font-bold !px-8"
                  >
                    Descargar comprobante
                  </Button>

                  <Link to="/">
                    <Button
                      size="large"
                      className="!h-12 !rounded-2xl !font-bold !px-8"
                    >
                      Volver al inicio
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />

        <main className="max-w-5xl mx-auto px-8 py-12">
          <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 text-center">
            <Result
              status="warning"
              title="No encontramos el pedido"
              subTitle="Puedes revisar tus pedidos desde Mi cuenta."
              extra={
                <Link to="/mi-cuenta">
                  <Button
                    size="large"
                    className="!h-12 !rounded-2xl !font-bold !px-8"
                  >
                    Ir a Mi cuenta
                  </Button>
                </Link>
              }
            />
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  const avisoPago = obtenerAvisoPago(pedido);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-8 py-12">
        <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="bg-gray-950 text-white px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-400 text-gray-950 flex items-center justify-center mx-auto mb-5">
                <CheckCircleOutlined className="text-4xl" />
              </div>

              <h1 className="text-4xl font-black">
                Compra realizada correctamente
              </h1>

              <p className="text-gray-300 mt-3">
                Gracias por comprar en Econnet. Hemos recibido tu pedido.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <Result
              status="success"
              title={
                pedido.estadoPago === "aprobado"
                  ? "Tu pago fue aprobado con éxito"
                  : "Tu pedido fue generado con éxito"
              }
              subTitle={`Número de pedido: ${pedido.numero}`}
              extra={null}
            />

            {avisoPago && (
              <Alert
                type={avisoPago.tipo}
                message={avisoPago.titulo}
                description={avisoPago.descripcion}
                showIcon
                className="!mb-6 !rounded-2xl"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-4">
              <div className="bg-gray-100 rounded-2xl p-5 text-center">
                <FileTextOutlined className="text-3xl text-gray-900 mb-3" />

                <h3 className="font-black text-gray-900">
                  {pedido.estadoPago === "aprobado"
                    ? "Total pagado"
                    : "Total del pedido"}
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  {formatearPrecio(pedido.total)}
                </p>
              </div>

              <div className="bg-gray-100 rounded-2xl p-5 text-center">
                <ShoppingOutlined className="text-3xl text-gray-900 mb-3" />

                <h3 className="font-black text-gray-900">Método de pago</h3>

                <p className="text-sm text-gray-600 mt-2">
                  {formatearMetodoPago(pedido.metodoPago)}
                </p>
              </div>
              <div className="bg-gray-100 rounded-2xl p-5 text-center">
                <CheckCircleOutlined className="text-3xl text-gray-900 mb-3" />

                <h3 className="font-black text-gray-900">Estado pago</h3>

                <div className="mt-2">
                  <Tag color={obtenerColorEstadoPago(pedido.estadoPago)}>
                    {formatearEstadoPago(pedido.estadoPago).toUpperCase()}
                  </Tag>
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl p-5 text-center">
                <TruckOutlined className="text-3xl text-gray-900 mb-3" />

                <h3 className="font-black text-gray-900">Entrega</h3>

                <p className="text-sm text-gray-600 mt-2">
                  {formatearTipoEntrega(pedido.tipoEntrega)}
                </p>
              </div>
            </div>

            <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="font-black text-gray-900 mb-3">
                Resumen del pedido
              </h3>

              <div className="space-y-3 text-sm">
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

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">Neto</span>
                    <span className="font-black text-gray-700">
                      {formatearPrecio(pedido.neto)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-bold text-gray-700">
                      IVA incluido 19%
                    </span>
                    <span className="font-black text-gray-700">
                      {formatearPrecio(pedido.iva)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-black text-gray-900">Total</span>
                    <span className="font-black text-gray-950">
                      {formatearPrecio(pedido.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <p className="font-bold text-gray-700">Dirección</p>

                <p className="text-sm text-gray-600 mt-1">
                  {pedido.tipoEntrega === "retiro"
                    ? "Retiro en tienda Econnet"
                    : `${pedido.direccionTexto || ""}, ${
                        pedido.comuna || ""
                      }, ${pedido.region || ""}`}
                </p>
              </div>

              {["webpay", "oneclick"].includes(pedido.metodoPago) && (
                <div className="mt-5 border-t border-gray-200 pt-5">
                  <p className="font-bold text-gray-700">
                    {pedido.metodoPago === "oneclick"
                      ? "Información Oneclick"
                      : "Información Webpay"}
                  </p>

                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p>
                      <span className="font-bold">Orden: </span>
                      {pedido.ordenCompraPago || ordenWebpay || "No registrada"}
                    </p>

                    <p>
                      <span className="font-bold">Código autorización: </span>
                      {pedido.codigoAutorizacion || "No registrado"}
                    </p>

                    <p>
                      <span className="font-bold">Fecha de pago: </span>
                      {pedido.fechaPago
                        ? formatearFecha(pedido.fechaPago)
                        : "No registrada"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              {pedido.estadoPago === "aprobado" && (
                <Button
                  size="large"
                  icon={<DownloadOutlined />}
                  loading={descargandoDocumento}
                  onClick={handleDescargarDocumento}
                  className="!h-12 !rounded-2xl !font-bold !px-8"
                >
                  Descargar comprobante
                </Button>
              )}

              <Link
                to={`/seguimiento-compra?pedidoId=${pedidoId}&orden=${encodeURIComponent(
                  ordenWebpay || "",
                )}`}
              >
                <Button
                  size="large"
                  className="!h-12 !rounded-2xl !font-bold !px-8"
                >
                  Ver seguimiento
                </Button>
              </Link>

              <Link to="/mi-cuenta">
                <Button
                  size="large"
                  className="!h-12 !rounded-2xl !font-bold !px-8"
                >
                  Ver mis pedidos
                </Button>
              </Link>

              <Link to="/productos">
                <Button
                  size="large"
                  className="!h-12 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black !px-8 hover:!bg-black"
                >
                  Seguir comprando
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default CompraExitosa;
