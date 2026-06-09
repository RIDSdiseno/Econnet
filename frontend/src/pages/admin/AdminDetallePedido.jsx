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
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  obtenerPedidoAdminPorId,
  actualizarEstadoPedidoAdmin,
} from "../../services/adminApi";
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

function AdminDetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [actualizando, setActualizando] = useState(false);

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

  useEffect(() => {
    cargarPedido();
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

          <h1 className="text-2xl font-bold mb-1">
            Pedido {pedido.numero}
          </h1>

          <p className="text-gray-500">
            Detalle completo del pedido seleccionado.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={cargarPedido}
          loading={cargando}
        >
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <p className="text-gray-500 mb-1">Estado actual</p>

                <Tag color={coloresEstado[pedido.estado] || "default"}>
                  {textoEstado(pedido.estado)}
                </Tag>
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
                {pedido.metodoPago || "No definido"}
              </Descriptions.Item>

              <Descriptions.Item label="Documento">
                {pedido.documento || "No definido"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <Descriptions
              title="Cliente"
              bordered
              column={1}
              size="middle"
            >
              <Descriptions.Item label="Nombre">
                {pedido.usuario?.nombre || pedido.nombreCliente || "Sin nombre"}
              </Descriptions.Item>

              <Descriptions.Item label="Correo">
                {pedido.usuario?.email || pedido.emailCliente || "Sin correo"}
              </Descriptions.Item>

              <Descriptions.Item label="Teléfono">
                {pedido.usuario?.telefono || pedido.telefonoCliente || "Sin teléfono"}
              </Descriptions.Item>

              <Descriptions.Item label="RUT">
                {pedido.usuario?.rut || "Sin RUT"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <Descriptions
              title="Entrega"
              bordered
              column={1}
              size="middle"
            >
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