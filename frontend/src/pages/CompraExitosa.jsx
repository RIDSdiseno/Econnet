import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Button, Result, message } from "antd";
import {
  CheckCircleOutlined,
  ShoppingOutlined,
  HomeOutlined,
  FileTextOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { obtenerPedidoPorId } from "../services/api";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function formatearMetodoPago(metodo) {
  const metodos = {
    transferencia: "Transferencia bancaria",
    webpay: "Webpay / Tarjeta",
    mercadopago: "Mercado Pago",
  };

  return metodos[metodo] || metodo || "No informado";
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

  const [pedido, setPedido] = useState(null);
  const [cargandoPedido, setCargandoPedido] = useState(true);

  useEffect(() => {
    const cargarPedido = async () => {
      if (cargandoAuth) return;

      if (!estaLogueado || !token) {
        message.info("Inicia sesión para ver el detalle de tu compra");
        navigate("/login");
        return;
      }

      if (!pedidoId) {
        setCargandoPedido(false);
        return;
      }

      try {
        setCargandoPedido(true);

        const data = await obtenerPedidoPorId(token, pedidoId);
        setPedido(data);
      } catch (error) {
        message.error(error.message || "No se pudo cargar el pedido");
      } finally {
        setCargandoPedido(false);
      }
    };

    cargarPedido();
  }, [pedidoId, token, estaLogueado, cargandoAuth, navigate]);

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

  if (!pedido) {
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
              title="Tu pedido fue generado con éxito"
              subTitle={`Número de pedido: ${pedido.numero}`}
              extra={null}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              <div className="bg-gray-100 rounded-2xl p-5 text-center">
                <FileTextOutlined className="text-3xl text-gray-900 mb-3" />

                <h3 className="font-black text-gray-900">Total pagado</h3>

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

                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-gray-950">
                    {formatearPrecio(pedido.total)}
                  </span>
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
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Link to={`/seguimiento-compra?pedidoId=${pedido.id}`}>
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