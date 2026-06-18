import { useEffect, useState } from "react";
import { Table, Tag, Button, Select, message, Card, Tooltip } from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  obtenerPedidosAdmin,
  actualizarEstadoPedidoAdmin,
} from "../../services/adminApi";

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

  const fechaObj = new Date(fecha);

  const dia = String(fechaObj.getDate()).padStart(2, "0");
  const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
  const anio = fechaObj.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

function acortarNumeroPedido(numero) {
  if (!numero) return "Sin número";

  if (numero.length <= -4) {
    return numero;
  }

  return `${numero.slice(0, 7)}...${numero.slice(-4)}`;
}

function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState(null);

  const navigate = useNavigate();
  const { token } = useAuth();

  const tokenActual = token || localStorage.getItem("token");

  const cargarPedidos = async () => {
    try {
      setCargando(true);

      const data = await obtenerPedidosAdmin(tokenActual);

      setPedidos(data.pedidos || []);
    } catch (error) {
      message.error(error.message || "No se pudieron cargar los pedidos");
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      setActualizandoId(pedidoId);

      await actualizarEstadoPedidoAdmin(tokenActual, pedidoId, nuevoEstado);

      message.success("Estado actualizado correctamente");
      cargarPedidos();
    } catch (error) {
      message.error(error.message || "No se pudo actualizar el estado");
    } finally {
      setActualizandoId(null);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const columnas = [
    {
      title: "N° Pedido",
      dataIndex: "numero",
      key: "numero",
      width: 90,
      render: (numero, pedido) => (
        <Tooltip title={numero}>
          <button
            type="button"
            onClick={() => navigate(`/admin/pedidos/${pedido.id}`)}
            className="font-bold text-gray-950 hover:text-blue-600 hover:underline whitespace-nowrap"
          >
            {acortarNumeroPedido(numero)}
          </button>
        </Tooltip>
      ),
    },
    {
      title: "Cliente",
      key: "cliente",
      render: (_, pedido) => (
        <div>
          <p className="font-semibold m-0">
            {pedido.usuario?.nombre || pedido.nombreCliente || "Sin nombre"}
          </p>
          <p className="text-xs text-gray-500 m-0">
            {pedido.usuario?.email || pedido.emailCliente || "Sin correo"}
          </p>
        </div>
      ),
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (fecha) => (
        <span className="whitespace-nowrap">{formatearFecha(fecha)}</span>
      ),
    },
    {
      title: "Entrega",
      dataIndex: "tipoEntrega",
      key: "tipoEntrega",
      render: (tipo) => (
        <Tag color={tipo === "retiro" ? "green" : "blue"}>
          {tipo === "retiro" ? "Retiro" : "Despacho"}
        </Tag>
      ),
    },
    {
      title: "Método pago",
      dataIndex: "metodoPago",
      key: "metodoPago",
      width: 130,
      render: (metodo) => (
        <span className="capitalize whitespace-nowrap">
          {metodo === "webpay"
            ? "Webpay"
            : metodo === "transferencia"
              ? "Transferencia"
              : metodo || "No definido"}
        </span>
      ),
    },
    {
      title: "Estado pago",
      dataIndex: "estadoPago",
      key: "estadoPago",
      width: 130,
      render: (estadoPago) => (
        <Tag color={coloresEstadoPago[estadoPago] || "default"}>
          {(estadoPago || "pendiente").replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },

    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => <strong>{formatearPrecio(total)}</strong>,
    },

    {
      title: "Estado pedido",
      dataIndex: "estado",
      key: "estado",
      width: 140,
      render: (estado) => (
        <Tag color={coloresEstado[estado] || "default"}>
          {estado?.replace("_", " ").toUpperCase()}
        </Tag>
      ),
    },

    {
      title: "Cambiar estado",
      key: "cambiarEstado",
      render: (_, pedido) => (
        <Select
          value={pedido.estado}
          style={{ width: 160 }}
          loading={actualizandoId === pedido.id}
          disabled={actualizandoId === pedido.id}
          options={estadosPedido}
          onChange={(nuevoEstado) => cambiarEstado(pedido.id, nuevoEstado)}
        />
      ),
    },

    {
      title: "Acciones",
      key: "acciones",
      render: (_, pedido) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/pedidos/${pedido.id}`)}
        >
          Ver
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pedidos</h1>
          <p className="text-gray-500">
            Gestiona los pedidos realizados por los clientes.
          </p>
        </div>

        <Button
          icon={<ReloadOutlined />}
          onClick={cargarPedidos}
          loading={cargando}
        >
          Actualizar
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <Table
          rowKey="id"
          columns={columnas}
          dataSource={pedidos}
          loading={cargando}
          pagination={{
            pageSize: 8,
          }}
          scroll={{
            x: 1270,
          }}
        />
      </Card>
    </div>
  );
}

export default AdminPedidos;
