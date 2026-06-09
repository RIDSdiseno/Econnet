import { useEffect, useState } from "react";
import { Card, Table, Tag, message } from "antd";
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  UserOutlined,
  DollarOutlined,
  WarningOutlined,
  TagsOutlined,
  PictureOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { obtenerDashboardAdmin } from "../../services/adminApi";

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
}

function formatearFecha(fecha) {
  if (!fecha) return "Sin fecha";

  return new Date(fecha).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function CardResumen({ titulo, valor, icono, detalle }) {
  return (
    <Card className="rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">{titulo}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{valor}</h3>
          {detalle && <p className="text-xs text-gray-400">{detalle}</p>}
        </div>

        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl text-slate-700">
          {icono}
        </div>
      </div>
    </Card>
  );
}

function AdminDashboard() {
  const [resumen, setResumen] = useState(null);
  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [cargando, setCargando] = useState(false);

  const { token } = useAuth();
  const tokenActual = token || localStorage.getItem("token");

  const cargarDashboard = async () => {
    try {
      setCargando(true);

      const data = await obtenerDashboardAdmin(tokenActual);

      setResumen(data.resumen);
      setUltimosPedidos(data.ultimosPedidos || []);
    } catch (error) {
      message.error(error.message || "No se pudo cargar el dashboard");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const columnasPedidos = [
    {
      title: "N° Pedido",
      dataIndex: "numero",
      key: "numero",
      render: (numero) => <strong>{numero || "Sin número"}</strong>,
    },
    {
      title: "Cliente",
      key: "cliente",
      render: (_, pedido) =>
        pedido.usuario?.nombre || pedido.usuario?.email || "Sin cliente",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => <Tag color="blue">{estado || "Sin estado"}</Tag>,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => <strong>{formatearPrecio(total)}</strong>,
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (fecha) => formatearFecha(fecha),
    },
  ];

  const datos = resumen || {
    totalProductos: 0,
    productosActivos: 0,
    productosStockBajo: 0,
    totalPedidos: 0,
    pedidosPendientes: 0,
    totalUsuarios: 0,
    categoriasActivas: 0,
    anunciosActivos: 0,
    tarifasActivas: 0,
    ventasTotales: 0,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-500">
          Resumen general del estado actual de Econnet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <CardResumen
          titulo="Ventas totales"
          valor={formatearPrecio(datos.ventasTotales)}
          detalle="Pedidos no cancelados"
          icono={<DollarOutlined />}
        />

        <CardResumen
          titulo="Total de pedidos"
          valor={datos.totalPedidos}
          detalle={`${datos.pedidosPendientes} pendientes / en proceso`}
          icono={<ShoppingCartOutlined />}
        />

        <CardResumen
          titulo="Productos"
          valor={datos.totalProductos}
          detalle={`${datos.productosActivos} activos`}
          icono={<AppstoreOutlined />}
        />

        <CardResumen
          titulo="Usuarios registrados"
          valor={datos.totalUsuarios}
          detalle="Cuentas creadas en la tienda"
          icono={<UserOutlined />}
        />

        <CardResumen
          titulo="Stock bajo"
          valor={datos.productosStockBajo}
          detalle="Productos activos con 5 o menos unidades"
          icono={<WarningOutlined />}
        />

        <CardResumen
          titulo="Categorías activas"
          valor={datos.categoriasActivas}
          detalle="Disponibles para organizar productos"
          icono={<TagsOutlined />}
        />

        <CardResumen
          titulo="Anuncios activos"
          valor={datos.anunciosActivos}
          detalle="Banners y promos visibles"
          icono={<PictureOutlined />}
        />

        <CardResumen
          titulo="Tarifas despacho"
          valor={datos.tarifasActivas}
          detalle="Opciones de envío activas"
          icono={<TruckOutlined />}
        />
      </div>

      <Card
        title="Últimos pedidos"
        className="rounded-2xl shadow-sm border border-gray-100"
      >
        <Table
          rowKey="id"
          columns={columnasPedidos}
          dataSource={ultimosPedidos}
          loading={cargando}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}

export default AdminDashboard;