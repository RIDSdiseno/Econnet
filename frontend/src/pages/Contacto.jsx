import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Checkbox, Input, message, Select } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  CustomerServiceOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { crearTicketSoporte, obtenerPedidos } from "../services/api";
import { useAuth } from "../context/AuthContext";

const { TextArea } = Input;

const categoriasSoporte = [
  {
    value: "despacho",
    label: "Despacho y seguimiento",
  },
  {
    value: "pagos",
    label: "Pagos",
  },
  {
    value: "documentos",
    label: "Boletas y facturas",
  },
  {
    value: "garantias",
    label: "Garantías",
  },
  {
    value: "devoluciones",
    label: "Devoluciones",
  },
  {
    value: "reembolsos",
    label: "Reembolsos",
  },
  {
    value: "compras_empresas",
    label: "Compras para empresas y cotizaciones",
  },
  {
    value: "soporte_tecnico",
    label: "Soporte técnico",
  },
  {
    value: "otro",
    label: "Otro",
  },
];

const CATEGORIAS_CON_PEDIDO = new Set([
  "despacho",
  "pagos",
  "garantias",
  "devoluciones",
  "reembolsos",
]);

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function formatearFechaPedido(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Contacto() {
  const { usuario, token, cargandoAuth } = useAuth();
  const formularioRef = useRef(null);

  const [enviando, setEnviando] = useState(false);
  const [ticketCreado, setTicketCreado] = useState(null);
  const [pedidosUsuario, setPedidosUsuario] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    categoria: "",
    pedidoId: null,
    asunto: "",
    mensaje: "",
    aceptaPrivacidad: false,
  });

  useEffect(() => {
    if (!usuario) {
      return;
    }

    setFormulario((prev) => ({
      ...prev,
      nombre: prev.nombre || usuario.nombre || "",
      correo: prev.correo || usuario.email || "",
      telefono: prev.telefono || usuario.telefono || "",
    }));
  }, [usuario]);

  useEffect(() => {
    const cargarPedidosUsuario = async () => {
      if (!token || !usuario) {
        setPedidosUsuario([]);

        setFormulario((prev) => ({
          ...prev,
          pedidoId: null,
        }));

        return;
      }

      try {
        setCargandoPedidos(true);

        const pedidos = await obtenerPedidos(token);

        setPedidosUsuario(Array.isArray(pedidos) ? pedidos : []);
      } catch (error) {
        console.error("Error al cargar pedidos para soporte:", error);

        message.error(error.message || "No se pudieron cargar tus pedidos");
      } finally {
        setCargandoPedidos(false);
      }
    };

    cargarPedidosUsuario();
  }, [token, usuario?.id]);

  const actualizarCampo = (campo, valor) => {
    setFormulario((prev) => {
      if (campo === "categoria") {
        return {
          ...prev,
          categoria: valor,
          pedidoId: null,
        };
      }

      return {
        ...prev,
        [campo]: valor,
      };
    });
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: usuario?.nombre || "",
      correo: usuario?.email || "",
      telefono: usuario?.telefono || "",
      categoria: "",
      pedidoId: null,
      asunto: "",
      mensaje: "",
      aceptaPrivacidad: false,
    });
  };

  const validarFormulario = () => {
    if (!formulario.nombre.trim()) {
      message.warning("Ingresa tu nombre");
      return false;
    }

    if (!formulario.correo.trim()) {
      message.warning("Ingresa tu correo electrónico");
      return false;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correoValido.test(formulario.correo.trim())) {
      message.warning("Ingresa un correo válido");
      return false;
    }

    if (!formulario.categoria) {
      message.warning("Selecciona una categoría");
      return false;
    }

    if (!formulario.asunto.trim()) {
      message.warning("Ingresa el asunto de tu solicitud");
      return false;
    }

    if (!formulario.mensaje.trim()) {
      message.warning("Escribe tu mensaje");
      return false;
    }

    if (!formulario.aceptaPrivacidad) {
      message.warning("Debes aceptar la política de privacidad");
      return false;
    }

    return true;
  };

  const enviarFormulario = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setEnviando(true);
      setTicketCreado(null);

      const datosTicket = {
        nombre: formulario.nombre.trim(),
        email: formulario.correo.trim(),
        telefono: formulario.telefono.trim(),
        categoria: formulario.categoria,
        asunto: formulario.asunto.trim(),
        mensaje: formulario.mensaje.trim(),
        aceptaPrivacidad: formulario.aceptaPrivacidad,
      };

      if (formulario.pedidoId) {
        datosTicket.pedidoId = Number(formulario.pedidoId);
      }

      const respuesta = await crearTicketSoporte(datosTicket, token);
      setTicketCreado(respuesta.ticket);

      message.success(respuesta.mensaje || "Solicitud enviada correctamente");

      limpiarFormulario();
    } catch (error) {
      console.error("Error enviando solicitud de soporte:", error);

      message.error(error.message || "No se pudo enviar la solicitud");
    } finally {
      setEnviando(false);
    }
  };

  const prepararCotizacion = () => {
    setTicketCreado(null);

    setFormulario((prev) => ({
      ...prev,
      categoria: "compras_empresas",
      pedidoId: null,
      asunto: "Solicitud de cotización",
    }));
    formularioRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-8">
          <Link to="/" className="text-blue-600 hover:underline">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span>Contacto</span>
        </div>

        {/* Título */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm mb-5">
            <CustomerServiceOutlined className="text-emerald-500" />

            <span className="text-sm font-bold text-gray-700">
              Atención al cliente
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900">
            Contáctanos
          </h1>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Escríbenos si necesitas ayuda con productos, cotizaciones,
            seguimiento de compra o soporte general.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Formulario */}
          <div
            ref={formularioRef}
            className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 md:p-10 scroll-mt-24"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Envíanos un mensaje
            </h2>

            <p className="text-gray-600 mb-7">
              Completa el formulario y te entregaremos un código para
              identificar tu solicitud.
            </p>

            {ticketCreado && (
              <Alert
                showIcon
                type="success"
                className="!mb-7 !rounded-2xl"
                message="Solicitud enviada correctamente"
                description={
                  <div className="mt-1">
                    <p>Tu código de solicitud es:</p>

                    <p className="font-black text-lg mt-1">
                      {ticketCreado.codigo}
                    </p>

                    <p className="text-sm mt-2">
                      Guarda este código para identificar tu solicitud.
                    </p>
                  </div>
                }
                closable
                onClose={() => setTicketCreado(null)}
              />
            )}

            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-800">
                  Nombre
                </label>

                <Input
                  size="large"
                  maxLength={120}
                  placeholder="Ingresa tu nombre"
                  prefix={<UserOutlined className="text-gray-400" />}
                  value={formulario.nombre}
                  onChange={(e) => actualizarCampo("nombre", e.target.value)}
                  className="!h-13 !rounded-xl !mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Correo electrónico
                </label>

                <Input
                  size="large"
                  maxLength={180}
                  placeholder="Ingresa tu correo"
                  prefix={<MailOutlined className="text-gray-400" />}
                  value={formulario.correo}
                  onChange={(e) => actualizarCampo("correo", e.target.value)}
                  className="!h-13 !rounded-xl !mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Teléfono
                </label>

                <Input
                  size="large"
                  maxLength={30}
                  placeholder="Ingresa tu teléfono"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  value={formulario.telefono}
                  onChange={(e) => actualizarCampo("telefono", e.target.value)}
                  className="!h-13 !rounded-xl !mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Categoría
                </label>

                <Select
                  size="large"
                  value={formulario.categoria || undefined}
                  placeholder="Selecciona una categoría"
                  options={categoriasSoporte}
                  onChange={(valor) => actualizarCampo("categoria", valor)}
                  suffixIcon={<TagsOutlined />}
                  className="!w-full !mt-2"
                />
              </div>

              {CATEGORIAS_CON_PEDIDO.has(formulario.categoria) && usuario && (
                <div>
                  <label className="text-sm font-bold text-gray-800">
                    Pedido relacionado
                  </label>

                  <Select
                    size="large"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    value={formulario.pedidoId || undefined}
                    placeholder={
                      cargandoPedidos
                        ? "Cargando tus pedidos..."
                        : "Selecciona un pedido (opcional)"
                    }
                    loading={cargandoPedidos}
                    disabled={cargandoPedidos || pedidosUsuario.length === 0}
                    notFoundContent={
                      cargandoPedidos
                        ? "Cargando pedidos..."
                        : "No tienes pedidos disponibles"
                    }
                    options={pedidosUsuario.map((pedido) => ({
                      value: pedido.id,
                      label: `${pedido.numero} · ${formatearFechaPedido(
                        pedido.createdAt,
                      )} · ${formatearPrecio(pedido.total)}`,
                    }))}
                    onChange={(valor) =>
                      actualizarCampo("pedidoId", valor || null)
                    }
                    className="!w-full !mt-2"
                  />

                  <p className="text-xs text-gray-500 mt-2">
                    Selecciona el pedido relacionado con tu consulta. Este campo
                    es opcional.
                  </p>

                  {!cargandoPedidos && pedidosUsuario.length === 0 && (
                    <p className="text-sm text-orange-600 mt-2">
                      No encontramos pedidos asociados a tu cuenta.
                    </p>
                  )}
                </div>
              )}

              {CATEGORIAS_CON_PEDIDO.has(formulario.categoria) &&
                !usuario &&
                !cargandoAuth && (
                  <Alert
                    showIcon
                    type="info"
                    className="!rounded-2xl"
                    message="Puedes asociar un pedido iniciando sesión"
                    description={
                      <span>
                        Puedes enviar igualmente tu consulta como visitante o{" "}
                        <Link to="/login" className="font-bold underline">
                          iniciar sesión
                        </Link>{" "}
                        para seleccionar uno de tus pedidos.
                      </span>
                    }
                  />
                )}

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Asunto
                </label>

                <Input
                  size="large"
                  maxLength={180}
                  placeholder="Resume brevemente tu consulta"
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  value={formulario.asunto}
                  onChange={(e) => actualizarCampo("asunto", e.target.value)}
                  className="!h-13 !rounded-xl !mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Mensaje
                </label>

                <TextArea
                  rows={6}
                  maxLength={5000}
                  showCount
                  placeholder="Escribe tu mensaje aquí..."
                  value={formulario.mensaje}
                  onChange={(e) => actualizarCampo("mensaje", e.target.value)}
                  className="!rounded-xl !mt-2"
                />
              </div>

              <Checkbox
                checked={formulario.aceptaPrivacidad}
                onChange={(e) =>
                  actualizarCampo("aceptaPrivacidad", e.target.checked)
                }
              >
                <span className="text-sm text-gray-700">
                  He leído y acepto la{" "}
                  <Link
                    to="/politicas-privacidad"
                    className="font-bold underline"
                  >
                    política de privacidad
                  </Link>
                  .
                </span>
              </Checkbox>

              <Button
                size="large"
                type="primary"
                loading={enviando}
                disabled={enviando || cargandoAuth}
                onClick={enviarFormulario}
                icon={<MessageOutlined />}
                className="!h-13 !px-10 !rounded-2xl !bg-gray-950 !text-white !border-gray-950 !font-black hover:!bg-black"
              >
                {enviando ? "Enviando solicitud..." : "Enviar mensaje"}
              </Button>
            </div>
          </div>

          {/* Información lateral */}
          <aside className="space-y-5">
            <div className="bg-gray-950 text-white rounded-3xl shadow-sm p-7">
              <h2 className="text-2xl font-black mb-4">
                Información de contacto
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed">
                Nuestro equipo puede ayudarte con dudas sobre productos,
                disponibilidad, despacho, cotizaciones y soporte de compra.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-5">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <MailOutlined className="text-xl text-gray-900" />
                </div>

                <div>
                  <p className="font-black text-gray-900">Correo</p>

                  <p className="text-sm text-gray-600">contacto@econnet.cl</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <PhoneOutlined className="text-xl text-gray-900" />
                </div>

                <div>
                  <p className="font-black text-gray-900">Teléfono</p>

                  <p className="text-sm text-gray-600">+56 9 1234 5678</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <EnvironmentOutlined className="text-xl text-gray-900" />
                </div>

                <div>
                  <p className="font-black text-gray-900">Ubicación</p>

                  <p className="text-sm text-gray-600">Santiago de Chile</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <ClockCircleOutlined className="text-xl text-gray-900" />
                </div>

                <div>
                  <p className="font-black text-gray-900">
                    Horario de atención
                  </p>

                  <p className="text-sm text-gray-600">
                    Lunes a viernes, 09:00 a 18:00 hrs
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
              <h3 className="font-black text-gray-900 mb-2">
                ¿Necesitas una cotización?
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                También puedes contactarnos para compras de empresa, proyectos o
                equipamiento tecnológico.
              </p>

              <Button
                block
                onClick={prepararCotizacion}
                className="!h-12 !rounded-xl !font-bold"
              >
                Solicitar cotización
              </Button>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contacto;
