import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Select,
  Table,
  Tag,
  Timeline,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  DownloadOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import {
  obtenerPedidoAdminPorId,
  actualizarEstadoPedidoAdmin,
  obtenerEnviosPedidoAdmin,
  generarEnvioBlueExpressAdmin,
} from "../../services/adminApi";
import { descargarDocumentoPedido } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const estadosPedido = [
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmado", label: "Confirmado" },
  { value: "preparando", label: "Preparando" },
  { value: "empaquetando", label: "Empaquetando" },
  { value: "en_despacho", label: "En despacho" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

const coloresEstado = {
  pendiente: "orange",
  confirmado: "blue",
  preparando: "purple",
  empaquetando: "cyan",
  en_despacho: "geekblue",
  entregado: "green",
  cancelado: "red",
};
const coloresEstadoPago = {
  pendiente: "orange",
  aprobado: "green",
  rechazado: "red",
  cancelado: "volcano",
};

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function textoEstado(estado) {
  if (!estado) return "Sin estado";
  return estado.replace("_", " ").toUpperCase();
}

function textoMetodoPago(metodo) {
  if (metodo === "webpay") return "Webpay";
  if (metodo === "oneclick") return "Oneclick";
  if (metodo === "mercadopago") return "Mercado Pago";
  if (metodo === "transferencia") return "Transferencia bancaria";

  return metodo || "No definido";
}

function AdminDetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [descargandoDocumento, setDescargandoDocumento] = useState(false);
  const [envios, setEnvios] = useState([]);
  const [cargandoEnvios, setCargandoEnvios] = useState(false);
  const [generandoEnvio, setGenerandoEnvio] = useState(false);

  const cargarPedido = async () => {
    try {
      setCargando(true);

      const data = await obtenerPedidoAdminPorId(tokenActual, id);

      setPedido(data.pedido);
    } catch (error) {
      message.error(error.message || "No se pudo cargar el pedido");
    } finally {
      setCargando(false);
    }
  };

  const cargarEnviosPedido = async () => {
    try {
      setCargandoEnvios(true);

      const data = await obtenerEnviosPedidoAdmin(tokenActual, id);

      setEnvios(data);
    } catch (error) {
      message.error(error.message || "No se pudieron cargar los envíos");
    } finally {
      setCargandoEnvios(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      setActualizando(true);

      await actualizarEstadoPedidoAdmin(tokenActual, id, nuevoEstado);

      message.success("Estado actualizado correctamente");
      cargarPedido();
    } catch (error) {
      message.error(error.message || "No se pudo actualizar el estado");
    } finally {
      setActualizando(false);
    }
  };

  const descargarArchivo = (blob, nombreArchivo) => {
    const urlTemporal = window.URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = urlTemporal;
    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    window.URL.revokeObjectURL(urlTemporal);
  };

  const descargarComprobantePedido = async () => {
    if (!pedido?.id) {
      message.warning("No se encontró el pedido");
      return;
    }

    if (pedido.estadoPago !== "aprobado") {
      message.warning(
        "El comprobante estará disponible cuando el pago esté aprobado",
      );
      return;
    }

    try {
      setDescargandoDocumento(true);

      const { blob, nombreArchivo } = await descargarDocumentoPedido(
        tokenActual,
        pedido.id,
      );

      descargarArchivo(
        blob,
        nombreArchivo || `comprobante-pedido-${pedido.id}.pdf`,
      );

      message.success("Comprobante descargado correctamente");
    } catch (error) {
      message.error(error.message || "No se pudo descargar el comprobante");
    } finally {
      setDescargandoDocumento(false);
    }
  };

  const generarEnvioBlueExpress = async () => {
    if (!pedido?.id) {
      message.warning("No se encontró el pedido");
      return;
    }

    if (pedido.estadoPago !== "aprobado") {
      message.warning("Solo puedes generar envío para pedidos pagados");
      return;
    }

    if (pedido.tipoEntrega !== "despacho") {
      message.warning("Este pedido es retiro en tienda, no requiere envío");
      return;
    }

    if (pedido.estado === "cancelado") {
      message.warning("No puedes generar envío para un pedido cancelado");
      return;
    }

    try {
      setGenerandoEnvio(true);

      await generarEnvioBlueExpressAdmin(tokenActual, pedido.id, {
        pesoGramos: 1000,
        altoCm: 10,
        anchoCm: 20,
        largoCm: 30,
      });

      message.success("Envío Blue Express generado correctamente");

      await cargarPedido();
      await cargarEnviosPedido();
    } catch (error) {
      message.error(error.message || "No se pudo generar el envío");
    } finally {
      setGenerandoEnvio(false);
    }
  };

  useEffect(() => {
    cargarPedido();
    cargarEnviosPedido();
  }, [id]);

  const columnasProductos = [
    {
      title: "Producto",
      key: "producto",
      render: (_, item) => (
        <div className="flex items-center gap-3">
          {item.imagenUrl && (
            <img
              src={item.imagenUrl}
              alt={item.nombreProducto}
              className="w-12 h-12 object-contain rounded-lg border border-gray-200 bg-white"
            />
          )}

          <div>
            <p className="font-semibold m-0">{item.nombreProducto}</p>
            <p className="text-xs text-gray-500 m-0">
              {item.marcaProducto || "Sin marca"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Precio unitario",
      dataIndex: "precioUnitario",
      key: "precioUnitario",
      render: (valor) => formatearPrecio(valor),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (valor) => <strong>{formatearPrecio(valor)}</strong>,
    },
  ];

  const tieneEnvioBlueExpressActivo = envios.some(
    (envio) =>
      envio.courier === "blue_express" &&
      !["cancelado", "error"].includes(envio.estado),
  );

  if (cargando) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <Card>
        <p>No se encontró el pedido.</p>

        <Button onClick={() => navigate("/admin/pedidos")}>
          Volver a pedidos
        </Button>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/pedidos")}
            className="mb-4"
          >
            Volver
          </Button>

          <h1 className="text-2xl font-bold mb-1">Pedido {pedido.numero}</h1>

          <p className="text-gray-500">
            Detalle completo del pedido seleccionado.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {pedido.estadoPago === "aprobado" &&
            pedido.tipoEntrega === "despacho" &&
            !tieneEnvioBlueExpressActivo && (
              <Button
                icon={<TruckOutlined />}
                loading={generandoEnvio}
                onClick={generarEnvioBlueExpress}
              >
                Generar envío Blue Express
              </Button>
            )}

          {pedido.estadoPago === "aprobado" && (
            <Button
              icon={<DownloadOutlined />}
              loading={descargandoDocumento}
              onClick={descargarComprobantePedido}
            >
              Descargar comprobante
            </Button>
          )}

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              cargarPedido();
              cargarEnviosPedido();
            }}
            loading={cargando || cargandoEnvios}
          >
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <p className="text-gray-500 mb-1">Estado pedido</p>

                  <Tag color={coloresEstado[pedido.estado] || "default"}>
                    {textoEstado(pedido.estado)}
                  </Tag>
                </div>

                <div>
                  <p className="text-gray-500 mb-1">Estado pago</p>

                  <Tag
                    color={coloresEstadoPago[pedido.estadoPago] || "default"}
                  >
                    {textoEstado(pedido.estadoPago || "pendiente")}
                  </Tag>
                </div>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Cambiar estado</p>

                <Select
                  value={pedido.estado}
                  options={estadosPedido}
                  onChange={cambiarEstado}
                  loading={actualizando}
                  disabled={actualizando}
                  style={{ width: 190 }}
                />
              </div>
            </div>

            <Divider />

            <Descriptions
              title="Información del pedido"
              bordered
              column={1}
              size="middle"
            >
              <Descriptions.Item label="Número de pedido">
                {pedido.numero}
              </Descriptions.Item>

              <Descriptions.Item label="Fecha">
                {formatearFecha(pedido.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item label="Tipo de entrega">
                {pedido.tipoEntrega === "retiro" ? "Retiro" : "Despacho"}
              </Descriptions.Item>

              <Descriptions.Item label="Método de pago">
                {textoMetodoPago(pedido.metodoPago)}
              </Descriptions.Item>

              <Descriptions.Item label="Estado de pago">
                <Tag color={coloresEstadoPago[pedido.estadoPago] || "default"}>
                  {textoEstado(pedido.estadoPago || "pendiente")}
                </Tag>
              </Descriptions.Item>

              {pedido.metodoPago === "webpay" && (
                <>
                  <Descriptions.Item label="Orden Webpay">
                    {pedido.ordenCompraPago || "Sin orden registrada"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Código autorización">
                    {pedido.codigoAutorizacion || "Sin código"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Fecha de pago">
                    {pedido.fechaPago
                      ? formatearFecha(pedido.fechaPago)
                      : "Sin fecha de pago"}
                  </Descriptions.Item>
                </>
              )}

              <Descriptions.Item label="Documento">
                {pedido.documento || "No definido"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <Descriptions title="Cliente" bordered column={1} size="middle">
              <Descriptions.Item label="Nombre">
                {pedido.usuario?.nombre || pedido.nombreCliente || "Sin nombre"}
              </Descriptions.Item>

              <Descriptions.Item label="Correo">
                {pedido.usuario?.email || pedido.emailCliente || "Sin correo"}
              </Descriptions.Item>

              <Descriptions.Item label="Teléfono">
                {pedido.usuario?.telefono ||
                  pedido.telefonoCliente ||
                  "Sin teléfono"}
              </Descriptions.Item>

              <Descriptions.Item label="RUT">
                {pedido.usuario?.rut || "Sin RUT"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <Descriptions title="Entrega" bordered column={1} size="middle">
              <Descriptions.Item label="Dirección">
                {pedido.direccionTexto || "No aplica"}
              </Descriptions.Item>

              <Descriptions.Item label="Región">
                {pedido.region || "No aplica"}
              </Descriptions.Item>

              <Descriptions.Item label="Comuna">
                {pedido.comuna || "No aplica"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Productos comprados</h2>

            <Table
              rowKey="id"
              columns={columnasProductos}
              dataSource={pedido.items || []}
              pagination={false}
              scroll={{ x: 800 }}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Envío Blue Express</h2>

            {cargandoEnvios && (
              <p className="text-gray-500">Cargando envíos...</p>
            )}

            {!cargandoEnvios && envios.length === 0 && (
              <div className="text-sm text-gray-600">
                <p>Este pedido todavía no tiene envío generado.</p>

                {pedido.estadoPago === "aprobado" &&
                  pedido.tipoEntrega === "despacho" &&
                  !tieneEnvioBlueExpressActivo && (
                    <Button
                      block
                      icon={<TruckOutlined />}
                      loading={generandoEnvio}
                      onClick={generarEnvioBlueExpress}
                      className="!mt-4 !rounded-xl !font-bold"
                    >
                      Generar envío Blue Express
                    </Button>
                  )}
              </div>
            )}

            {!cargandoEnvios &&
              envios.length > 0 &&
              envios.map((envio) => (
                <div
                  key={envio.id}
                  className="border border-gray-200 rounded-xl p-4 mb-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-gray-900">
                      {envio.servicio || "Blue Express"}
                    </p>

                    <Tag color={envio.estado === "generado" ? "green" : "blue"}>
                      {envio.estado?.toUpperCase() || "SIN ESTADO"}
                    </Tag>
                  </div>

                  <Divider className="!my-3" />

                  <p className="text-sm text-gray-500">Orden de servicio</p>
                  <p className="font-bold break-all">
                    {envio.ordenServicio || "Sin orden"}
                  </p>

                  <p className="text-sm text-gray-500 mt-3">
                    Número de seguimiento
                  </p>
                  <p className="font-bold break-all">
                    {envio.numeroSeguimiento || "Sin seguimiento"}
                  </p>

                  <p className="text-sm text-gray-500 mt-3">Costo</p>
                  <p className="font-bold">
                    {formatearPrecio(envio.costo || 0)}
                  </p>

                  {envio.urlSeguimiento && (
                    <a
                      href={envio.urlSeguimiento}
                      target="_blank"
                      rel="noreferrer"
                      className="block mt-4"
                    >
                      <Button block className="!rounded-xl !font-bold">
                        Ver seguimiento
                      </Button>
                    </a>
                  )}
                </div>
              ))}
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Resumen</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <strong>{formatearPrecio(pedido.subtotal)}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Descuento</span>
                <strong className="text-emerald-600">
                  -{formatearPrecio(pedido.descuento)}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Despacho</span>
                <strong>{formatearPrecio(pedido.despacho)}</strong>
              </div>

              <Divider />

              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <strong>{formatearPrecio(pedido.total)}</strong>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4">Seguimiento</h2>

            <Timeline
              items={(pedido.seguimientos || []).map((item) => ({
                color: coloresEstado[item.estado] || "blue",
                children: (
                  <div>
                    <p className="font-semibold m-0">
                      {item.titulo || textoEstado(item.estado)}
                    </p>

                    <p className="text-sm text-gray-500 m-0">
                      {item.detalle || "Sin detalle"}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {formatearFecha(item.createdAt)}
                    </p>
                  </div>
                ),
              }))}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDetallePedido;
