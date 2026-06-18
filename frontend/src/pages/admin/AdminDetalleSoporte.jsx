import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  Input,
  Select,
  Spin,
  Tag,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  actualizarEstadoTicketSoporteAdmin,
  obtenerTicketSoporteAdminPorId,
  responderTicketSoporteAdmin,
} from "../../services/adminApi";

const { TextArea } = Input;

const estadosSoporte = [
  {
    value: "nuevo",
    label: "Nuevo",
  },
  {
    value: "en_revision",
    label: "En revisión",
  },
  {
    value: "respondido",
    label: "Respondido",
  },
  {
    value: "cerrado",
    label: "Cerrado",
  },
];

const nombresCategorias = {
  despacho: "Despacho y seguimiento",
  pagos: "Pagos",
  documentos: "Boletas y facturas",
  garantias: "Garantías",
  devoluciones: "Devoluciones",
  reembolsos: "Reembolsos",
  compras_empresas: "Compras para empresas",
  soporte_tecnico: "Soporte técnico",
  otro: "Otro",
};

const coloresEstado = {
  nuevo: "blue",
  en_revision: "orange",
  respondido: "green",
  cerrado: "default",
};

function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  return new Date(fecha).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearDinero(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(valor || 0));
}

function obtenerNombreEstado(estado) {
  const encontrado = estadosSoporte.find(
    (item) => item.value === estado,
  );

  return encontrado?.label || estado || "Sin estado";
}

function AdminDetalleSoporte() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  const tokenActual =
    token || localStorage.getItem("token");

  const [ticket, setTicket] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviandoRespuesta, setEnviandoRespuesta] =
    useState(false);
  const [actualizandoEstado, setActualizandoEstado] =
    useState(false);

  const [respuesta, setRespuesta] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] =
    useState("");

  const cargarTicket = async () => {
    try {
      setCargando(true);

      const data =
        await obtenerTicketSoporteAdminPorId(
          tokenActual,
          id,
        );

      setTicket(data.ticket);
      setEstadoSeleccionado(data.ticket.estado);
    } catch (error) {
      console.error(
        "Error al obtener la solicitud:",
        error,
      );

      message.error(
        error.message ||
          "No se pudo cargar la solicitud",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!tokenActual || !id) {
      return;
    }

    cargarTicket();
  }, [id, tokenActual]);

  const guardarEstado = async () => {
    if (!estadoSeleccionado) {
      message.warning("Selecciona un estado");
      return;
    }

    if (estadoSeleccionado === ticket.estado) {
      message.info(
        "La solicitud ya tiene ese estado",
      );
      return;
    }

    try {
      setActualizandoEstado(true);

      await actualizarEstadoTicketSoporteAdmin(
        tokenActual,
        id,
        estadoSeleccionado,
      );

      message.success(
        "Estado actualizado correctamente",
      );

      await cargarTicket();
    } catch (error) {
      console.error(
        "Error actualizando estado:",
        error,
      );

      message.error(
        error.message ||
          "No se pudo actualizar el estado",
      );
    } finally {
      setActualizandoEstado(false);
    }
  };

  const enviarRespuesta = async () => {
    const mensajeLimpio = respuesta.trim();

    if (!mensajeLimpio) {
      message.warning(
        "Escribe una respuesta para el cliente",
      );
      return;
    }

    if (mensajeLimpio.length > 5000) {
      message.warning(
        "La respuesta no puede superar los 5000 caracteres",
      );
      return;
    }

    try {
      setEnviandoRespuesta(true);

      await responderTicketSoporteAdmin(
        tokenActual,
        id,
        mensajeLimpio,
      );

      message.success(
        "Respuesta registrada correctamente",
      );

      setRespuesta("");

      await cargarTicket();
    } catch (error) {
      console.error(
        "Error respondiendo solicitud:",
        error,
      );

      message.error(
        error.message ||
          "No se pudo registrar la respuesta",
      );
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card className="!rounded-2xl">
        <Empty
          description="No se pudo encontrar la solicitud"
        />

        <div className="flex justify-center mt-5">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate("/admin/soporte")
            }
          >
            Volver al listado
          </Button>
        </div>
      </Card>
    );
  }

  const solicitudCerrada =
    ticket.estado === "cerrado";

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate("/admin/soporte")
            }
            className="!mb-4"
          >
            Volver a soporte
          </Button>

          <div className="flex items-center gap-3 flex-wrap">
            <CustomerServiceOutlined className="text-3xl text-blue-600" />

            <h1 className="text-3xl font-black text-gray-900 m-0">
              {ticket.codigo}
            </h1>

            <Tag
              color={
                coloresEstado[ticket.estado] ||
                "default"
              }
              className="!text-sm !px-3 !py-1"
            >
              {obtenerNombreEstado(ticket.estado)}
            </Tag>
          </div>

          <p className="text-gray-500 mt-2">
            Solicitud creada el{" "}
            {formatearFecha(ticket.createdAt)}
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={cargarTicket}
          loading={cargando}
          className="!h-11 !rounded-xl !font-bold"
        >
          Actualizar
        </Button>
      </div>

      {solicitudCerrada && (
        <Alert
          showIcon
          type="info"
          className="!rounded-2xl"
          message="Solicitud cerrada"
          description="Esta solicitud está cerrada y no admite nuevas respuestas. Puedes cambiar su estado para reabrirla."
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-6">
          {/* Datos del cliente */}
          <Card
            className="!rounded-2xl"
            title={
              <div className="flex items-center gap-2">
                <UserOutlined />
                <span>Datos del contacto</span>
              </div>
            }
          >
            <Descriptions
              bordered
              column={{
                xs: 1,
                sm: 1,
                md: 2,
              }}
            >
              <Descriptions.Item label="Nombre">
                {ticket.nombre}
              </Descriptions.Item>

              <Descriptions.Item label="Correo">
                <a
                  href={`mailto:${ticket.email}`}
                  className="font-semibold"
                >
                  <MailOutlined className="mr-2" />
                  {ticket.email}
                </a>
              </Descriptions.Item>

              <Descriptions.Item label="Teléfono">
                {ticket.telefono ? (
                  <a
                    href={`tel:${ticket.telefono}`}
                    className="font-semibold"
                  >
                    <PhoneOutlined className="mr-2" />
                    {ticket.telefono}
                  </a>
                ) : (
                  "No informado"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Usuario registrado">
                {ticket.usuario
                  ? `Sí, usuario #${ticket.usuario.id}`
                  : "No asociado"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Solicitud */}
          <Card
            className="!rounded-2xl"
            title={
              <div className="flex items-center gap-2">
                <MessageOutlined />
                <span>Consulta original</span>
              </div>
            }
          >
            <div className="flex flex-wrap gap-3 mb-5">
              <Tag color="geekblue">
                {nombresCategorias[
                  ticket.categoria
                ] ||
                  ticket.categoria ||
                  "Sin categoría"}
              </Tag>

              <Tag>
                Prioridad:{" "}
                {ticket.prioridad || "normal"}
              </Tag>
            </div>

            <h2 className="text-xl font-black text-gray-900">
              {ticket.asunto}
            </h2>

            <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {ticket.mensaje}
              </p>
            </div>
          </Card>

          {/* Historial */}
          <Card
            className="!rounded-2xl"
            title={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined />
                <span>Historial de respuestas</span>
              </div>
            }
          >
            {!ticket.respuestas?.length ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Todavía no existen respuestas"
              />
            ) : (
              <div className="space-y-4">
                {ticket.respuestas.map(
                  (item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-5 ${
                        item.tipoAutor === "admin"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <Tag
                            color={
                              item.tipoAutor ===
                              "admin"
                                ? "blue"
                                : "default"
                            }
                          >
                            {item.tipoAutor ===
                            "admin"
                              ? "Administrador"
                              : "Cliente"}
                          </Tag>

                          <span className="font-bold text-gray-900">
                            {item.autor?.nombre ||
                              "Econnet"}
                          </span>
                        </div>

                        <span className="text-xs text-gray-500">
                          {formatearFecha(
                            item.createdAt,
                          )}
                        </span>
                      </div>

                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {item.mensaje}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </Card>

          {/* Responder */}
          <Card
            className="!rounded-2xl"
            title={
              <div className="flex items-center gap-2">
                <MessageOutlined />
                <span>Responder solicitud</span>
              </div>
            }
          >
            <TextArea
              rows={7}
              maxLength={5000}
              showCount
              value={respuesta}
              disabled={solicitudCerrada}
              placeholder={
                solicitudCerrada
                  ? "La solicitud está cerrada"
                  : "Escribe aquí la respuesta para el cliente..."
              }
              onChange={(event) =>
                setRespuesta(event.target.value)
              }
              className="!rounded-xl"
            />

            <div className="flex justify-end mt-5">
              <Button
                type="primary"
                size="large"
                icon={<MessageOutlined />}
                loading={enviandoRespuesta}
                disabled={
                  solicitudCerrada ||
                  enviandoRespuesta
                }
                onClick={enviarRespuesta}
                className="!rounded-xl !font-bold"
              >
                Enviar respuesta
              </Button>
            </div>
          </Card>
        </div>

        {/* Panel lateral */}
        <aside className="space-y-6">
          <Card
            className="!rounded-2xl"
            title="Administrar estado"
          >
            <label className="block text-sm font-bold text-gray-800 mb-2">
              Estado de la solicitud
            </label>

            <Select
              size="large"
              value={estadoSeleccionado}
              options={estadosSoporte}
              onChange={setEstadoSeleccionado}
              className="!w-full"
            />

            <Button
              block
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={actualizandoEstado}
              onClick={guardarEstado}
              className="!mt-4 !rounded-xl !font-bold"
            >
              Guardar estado
            </Button>

            <Divider />

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircleOutlined className="text-green-600 mt-1" />

                <p className="text-gray-600">
                  Al responder, el estado cambia
                  automáticamente a{" "}
                  <strong>Respondido</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <ClockCircleOutlined className="text-orange-500 mt-1" />

                <p className="text-gray-600">
                  Una solicitud cerrada no puede
                  recibir nuevas respuestas.
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="!rounded-2xl"
            title="Información de la solicitud"
          >
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">
                  Código
                </p>

                <p className="font-black text-gray-900">
                  {ticket.codigo}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Fecha de creación
                </p>

                <p className="font-semibold text-gray-900">
                  {formatearFecha(
                    ticket.createdAt,
                  )}
                </p>
              </div>

              <div>
                <p className="text-gray-500">
                  Última actualización
                </p>

                <p className="font-semibold text-gray-900">
                  {formatearFecha(
                    ticket.updatedAt,
                  )}
                </p>
              </div>

              {ticket.cerradoAt && (
                <div>
                  <p className="text-gray-500">
                    Fecha de cierre
                  </p>

                  <p className="font-semibold text-gray-900">
                    {formatearFecha(
                      ticket.cerradoAt,
                    )}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {ticket.pedido && (
            <Card
              className="!rounded-2xl"
              title={
                <div className="flex items-center gap-2">
                  <ShoppingCartOutlined />
                  <span>Pedido relacionado</span>
                </div>
              }
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">
                    Número
                  </p>

                  <p className="font-black">
                    {ticket.pedido.numero}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Estado
                  </p>

                  <p className="font-semibold">
                    {ticket.pedido.estado}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Estado del pago
                  </p>

                  <p className="font-semibold">
                    {ticket.pedido.estadoPago}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Total
                  </p>

                  <p className="font-black text-lg">
                    {formatearDinero(
                      ticket.pedido.total,
                    )}
                  </p>
                </div>

                <Button
                  block
                  icon={<ShoppingCartOutlined />}
                  onClick={() =>
                    navigate(
                      `/admin/pedidos/${ticket.pedido.id}`,
                    )
                  }
                  className="!mt-3 !rounded-xl !font-bold"
                >
                  Ver pedido
                </Button>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

export default AdminDetalleSoporte;